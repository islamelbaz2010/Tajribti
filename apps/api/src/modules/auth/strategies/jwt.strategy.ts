import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consumer } from '../../../entities/consumer.entity';
import { BrandAccount } from '../../../entities/brand-account.entity';
import { CompanyEmployee } from '../../../entities/company-employee.entity';
import { AdminUser } from '../../../entities/admin-user.entity';

// Founder rulings W-1/W-2 (2026-09-02) added 'employee' (a real,
// authenticated Company Employee — see company-employee.entity.ts) and
// 'admin' (a real, authenticated TAJRIBTI operator — see
// admin-user.entity.ts) alongside the existing 'consumer'/'brand' types.
// 'employee' carries companyId (the owning BrandAccount's id) so every
// brand-scoped controller can resolve Company access the same way for
// both a BrandAccount owner and its employees — see company-scope.util.ts.
export interface JwtPayload {
  sub: string;
  identifier: string;
  type: 'consumer' | 'brand' | 'employee' | 'admin';
  companyId?: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  identifier: string;
  type: 'consumer' | 'brand' | 'employee' | 'admin';
  companyId?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(Consumer)
    private readonly consumerRepo: Repository<Consumer>,
    @InjectRepository(BrandAccount)
    private readonly brandRepo: Repository<BrandAccount>,
    @InjectRepository(CompanyEmployee)
    private readonly employeeRepo: Repository<CompanyEmployee>,
    @InjectRepository(AdminUser)
    private readonly adminRepo: Repository<AdminUser>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (payload.type === 'consumer') {
      const consumer = await this.consumerRepo.findOne({
        where: { id: payload.sub },
      });
      if (!consumer) {
        throw new UnauthorizedException('Consumer account not found');
      }
      return { id: consumer.id, identifier: consumer.phone, type: 'consumer' };
    }

    if (payload.type === 'brand') {
      const brand = await this.brandRepo.findOne({
        where: { id: payload.sub },
      });
      if (!brand) {
        throw new UnauthorizedException('Brand account not found');
      }
      return { id: brand.id, identifier: brand.email, type: 'brand' };
    }

    if (payload.type === 'employee') {
      const employee = await this.employeeRepo.findOne({
        where: { id: payload.sub },
      });
      if (!employee) {
        throw new UnauthorizedException('Employee account not found');
      }
      return {
        id: employee.id,
        identifier: employee.email,
        type: 'employee',
        companyId: employee.brandAccountId,
      };
    }

    if (payload.type === 'admin') {
      const admin = await this.adminRepo.findOne({
        where: { id: payload.sub },
      });
      if (!admin) {
        throw new UnauthorizedException('Admin account not found');
      }
      return { id: admin.id, identifier: admin.email, type: 'admin' };
    }

    throw new UnauthorizedException('Invalid token type');
  }
}
