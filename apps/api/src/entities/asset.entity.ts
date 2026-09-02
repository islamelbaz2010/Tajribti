import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

// Upload capability (2026-09-02): the repository has no existing file
// upload/storage subsystem — every image field (Campaign.productImage,
// BrandAccount.logoUrl, CampaignMedia.url) is a plain URL string, and no
// multer/S3/Cloudinary integration exists anywhere. Railway's `api` service
// (unlike its Postgres service, which has a real attached volume — verified
// via `railway volume list`) has no persistent disk: anything written to
// local disk is lost on the next deploy/restart. Reusing the one piece of
// already-provisioned, already-persistent infrastructure (Postgres) avoids
// inventing new storage architecture or standing up unauthorized
// third-party infra (S3/Cloudinary) for a pilot-scale image count. Images
// are capped (see assets.service.ts) to keep row/table size reasonable.
//
// ownerType/ownerId are a generic (not foreign-keyed) pointer so this one
// table serves both upload surfaces this pass adds (brand logo, campaign
// product image) without a separate table per owner kind; each owner kind's
// uniqueness (one logo per brand, one product image per campaign) is
// enforced in assets.service.ts, not by a DB constraint, exactly like the
// existing pattern of the app enforcing brand/campaign ownership in the
// service layer rather than the schema.
export enum AssetOwnerType {
  BRAND_LOGO = 'brand_logo',
  CAMPAIGN_PRODUCT_IMAGE = 'campaign_product_image',
}

@Entity('assets')
@Index(['ownerType', 'ownerId'])
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'owner_type', type: 'enum', enum: AssetOwnerType })
  ownerType: AssetOwnerType;

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId: string;

  @Column({ name: 'mime_type', length: 100 })
  mimeType: string;

  @Column({ type: 'bytea' })
  data: Buffer;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
