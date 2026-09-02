import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Asset, AssetOwnerType } from '../../entities/asset.entity';
import { BrandAccount } from '../../entities/brand-account.entity';
import { Campaign } from '../../entities/campaign.entity';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
// Pilot-scale cap (2026-09-02): images are stored as Postgres bytea rows
// (see asset.entity.ts), not a CDN/object store — 4MB keeps a handful of
// companies/campaigns' logos and product photos well within reasonable
// table size while still comfortably fitting a real phone photo saved at
// web-friendly quality.
const MAX_BYTES = 4 * 1024 * 1024;

export interface UploadedFileLike {
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepo: Repository<Asset>,
    @InjectRepository(BrandAccount)
    private readonly brandRepo: Repository<BrandAccount>,
    @InjectRepository(Campaign)
    private readonly campaignRepo: Repository<Campaign>,
    private readonly configService: ConfigService,
  ) {}

  // Uploaded assets are served from THIS API's own /assets/:id route (see
  // assets.controller.ts), which is on a different origin than the
  // Dashboard/consumer-web app (Railway vs Vercel) — a relative path would
  // resolve against the wrong origin in the browser. API_PUBLIC_URL is an
  // explicit override for local/custom setups; Railway auto-injects
  // RAILWAY_PUBLIC_DOMAIN for every service with no manual configuration,
  // so production needs no new env var. Falls back to localhost for
  // uncommon setups (bare `npm run start` with neither set).
  private assetBaseUrl(): string {
    const explicit = this.configService.get<string>('API_PUBLIC_URL');
    if (explicit) return explicit.replace(/\/+$/, '');
    const railwayDomain = this.configService.get<string>('RAILWAY_PUBLIC_DOMAIN');
    if (railwayDomain) return `https://${railwayDomain}`;
    return `http://localhost:${this.configService.get<string>('PORT') ?? '3000'}`;
  }

  private validate(file: UploadedFileLike | undefined): asserts file is UploadedFileLike {
    if (!file) throw new BadRequestException('No file uploaded');
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, or WebP images are allowed');
    }
    if (file.size > MAX_BYTES) {
      throw new BadRequestException('Image must be 4MB or smaller');
    }
  }

  private async replace(ownerType: AssetOwnerType, ownerId: string, file: UploadedFileLike): Promise<Asset> {
    // One asset per owner: remove any previous upload for this exact
    // owner before inserting the new one, so re-uploading a logo/product
    // image doesn't leave orphaned rows behind (no DB-level uniqueness
    // constraint — enforced here, same pattern as the rest of this
    // codebase's service-layer-enforced invariants).
    await this.assetRepo.delete({ ownerType, ownerId });
    return this.assetRepo.save(
      this.assetRepo.create({
        ownerType,
        ownerId,
        mimeType: file.mimetype,
        data: file.buffer,
      }),
    );
  }

  async uploadBrandLogo(brandId: string, file: UploadedFileLike | undefined): Promise<{ logoUrl: string }> {
    this.validate(file);
    const brand = await this.brandRepo.findOne({ where: { id: brandId } });
    if (!brand) throw new NotFoundException('Company not found');

    const asset = await this.replace(AssetOwnerType.BRAND_LOGO, brandId, file);
    brand.logoUrl = `${this.assetBaseUrl()}/api/v1/assets/${asset.id}`;
    await this.brandRepo.save(brand);
    return { logoUrl: brand.logoUrl };
  }

  async removeBrandLogo(brandId: string): Promise<{ logoUrl: null }> {
    const brand = await this.brandRepo.findOne({ where: { id: brandId } });
    if (!brand) throw new NotFoundException('Company not found');
    await this.assetRepo.delete({ ownerType: AssetOwnerType.BRAND_LOGO, ownerId: brandId });
    brand.logoUrl = null;
    await this.brandRepo.save(brand);
    return { logoUrl: null };
  }

  private async assertCampaignOwnership(brandId: string, campaignId: string): Promise<Campaign> {
    const campaign = await this.campaignRepo.findOne({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    // Ownership enforced server-side exactly like every other campaign
    // mutation in this codebase (campaign.service.ts's updateCampaign,
    // media.service.ts's assertBrandOwnership) — one Company can never
    // overwrite another Company's campaign image.
    if (campaign.brandAccountId !== brandId) throw new ForbiddenException('Access denied');
    return campaign;
  }

  async uploadCampaignProductImage(
    brandId: string,
    campaignId: string,
    file: UploadedFileLike | undefined,
  ): Promise<{ productImage: string }> {
    this.validate(file);
    const campaign = await this.assertCampaignOwnership(brandId, campaignId);

    const asset = await this.replace(AssetOwnerType.CAMPAIGN_PRODUCT_IMAGE, campaignId, file);
    campaign.productImage = `${this.assetBaseUrl()}/api/v1/assets/${asset.id}`;
    await this.campaignRepo.save(campaign);
    return { productImage: campaign.productImage };
  }

  async removeCampaignProductImage(brandId: string, campaignId: string): Promise<{ productImage: null }> {
    const campaign = await this.assertCampaignOwnership(brandId, campaignId);
    await this.assetRepo.delete({ ownerType: AssetOwnerType.CAMPAIGN_PRODUCT_IMAGE, ownerId: campaignId });
    campaign.productImage = null;
    await this.campaignRepo.save(campaign);
    return { productImage: null };
  }

  async getAsset(id: string): Promise<Asset> {
    const asset = await this.assetRepo.findOne({ where: { id } });
    if (!asset) throw new NotFoundException('Asset not found');
    return asset;
  }
}
