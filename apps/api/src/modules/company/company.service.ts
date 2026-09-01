import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrandAccount } from '../../entities/brand-account.entity';
import { BrandContact } from '../../entities/brand-contact.entity';
import { SurveyQuestion } from '../../entities/campaign.entity';
import { CreateBrandContactDto } from '../admin/dto/create-brand-contact.dto';
import { getSectorFramework } from './sector-framework';

// Self-service counterpart to admin.service.ts's Company/Contact
// management — scoped to the authenticated Company's own brandAccountId
// only (never another Company's data, enforced the same way every other
// brand-scoped controller in this codebase already does). A Company can
// manage its own contacts without needing an Admin round-trip for every
// campaign; sector/logo remain Admin-set (see UpdateBrandAccountDto) since
// they're provisioning-time facts, not something explicitly requested to
// be self-editable in this pass.
@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(BrandAccount)
    private readonly brandRepo: Repository<BrandAccount>,
    @InjectRepository(BrandContact)
    private readonly brandContactRepo: Repository<BrandContact>,
  ) {}

  async getMe(
    brandId: string,
  ): Promise<Pick<BrandAccount, 'id' | 'name' | 'email' | 'logoUrl' | 'sector' | 'createdAt'>> {
    const brand = await this.brandRepo.findOne({ where: { id: brandId } });
    if (!brand) throw new NotFoundException('Company not found');
    const { id, name, email, logoUrl, sector, createdAt } = brand;
    return { id, name, email, logoUrl, sector, createdAt };
  }

  async listContacts(brandId: string): Promise<BrandContact[]> {
    return this.brandContactRepo.find({ where: { brandAccountId: brandId }, order: { createdAt: 'DESC' } });
  }

  async createContact(brandId: string, dto: CreateBrandContactDto): Promise<BrandContact> {
    return this.brandContactRepo.save(
      this.brandContactRepo.create({
        brandAccountId: brandId,
        name: dto.name,
        email: dto.email,
        role: dto.role ?? null,
      }),
    );
  }

  async removeContact(brandId: string, contactId: string): Promise<void> {
    const contact = await this.brandContactRepo.findOne({ where: { id: contactId } });
    if (!contact || contact.brandAccountId !== brandId) {
      throw new NotFoundException('Contact not found');
    }
    await this.brandContactRepo.remove(contact);
  }

  async getSectorFramework(brandId: string): Promise<SurveyQuestion[]> {
    const brand = await this.brandRepo.findOne({ where: { id: brandId } });
    if (!brand) throw new NotFoundException('Company not found');
    return getSectorFramework(brand.sector);
  }
}
