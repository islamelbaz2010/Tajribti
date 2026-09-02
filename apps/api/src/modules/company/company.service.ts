import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrandAccount } from '../../entities/brand-account.entity';
import { BrandContact } from '../../entities/brand-contact.entity';
import { CompanyEmployee } from '../../entities/company-employee.entity';
import { SurveyQuestion } from '../../entities/campaign.entity';
import { CreateBrandContactDto } from '../admin/dto/create-brand-contact.dto';
import { getSectorFramework } from './sector-framework';

// Self-service counterpart to admin.service.ts's Company/Contact
// management — scoped to the authenticated Company's own brandAccountId
// only (never another Company's data, enforced the same way every other
// brand-scoped controller in this codebase already does). A Company can
// manage its own contacts without needing an Admin round-trip for every
// campaign; sector remains Admin-set (see UpdateBrandAccountDto) as a
// provisioning-time fact. Logo IS self-editable (Upload capability,
// 2026-09-02) via `AssetsController`'s `POST/DELETE /assets/logo` — that
// module writes `BrandAccount.logoUrl` directly (own repo injection) rather
// than routing through this service, so getMe() below simply reflects
// whatever value is currently stored.
@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(BrandAccount)
    private readonly brandRepo: Repository<BrandAccount>,
    @InjectRepository(BrandContact)
    private readonly brandContactRepo: Repository<BrandContact>,
    @InjectRepository(CompanyEmployee)
    private readonly employeeRepo: Repository<CompanyEmployee>,
  ) {}

  async getMe(
    brandId: string,
  ): Promise<
    Pick<BrandAccount, 'id' | 'name' | 'email' | 'logoUrl' | 'sector' | 'employeeCode' | 'createdAt'>
  > {
    const brand = await this.brandRepo.findOne({ where: { id: brandId } });
    if (!brand) throw new NotFoundException('Company not found');
    const { id, name, email, logoUrl, sector, employeeCode, createdAt } = brand;
    return { id, name, email, logoUrl, sector, employeeCode, createdAt };
  }

  // Founder ruling W-1 (2026-09-02): self-service visibility into who
  // currently has employee access to this Company — never returns
  // passwordHash (explicit response shape, not a raw entity spread).
  async listEmployees(
    brandId: string,
  ): Promise<Array<Pick<CompanyEmployee, 'id' | 'name' | 'email' | 'createdAt'>>> {
    const employees = await this.employeeRepo.find({
      where: { brandAccountId: brandId },
      order: { createdAt: 'DESC' },
    });
    return employees.map(({ id, name, email, createdAt }) => ({ id, name, email, createdAt }));
  }

  async removeEmployee(brandId: string, employeeId: string): Promise<void> {
    const employee = await this.employeeRepo.findOne({ where: { id: employeeId } });
    if (!employee || employee.brandAccountId !== brandId) {
      throw new NotFoundException('Employee not found for this company');
    }
    await this.employeeRepo.softRemove(employee);
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
