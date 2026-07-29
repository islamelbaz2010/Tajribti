import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consumer } from '../../../entities/consumer.entity';
import { BrandAccount } from '../../../entities/brand-account.entity';

export interface JwtPayload {
  sub: string;
  identifier: string;
  type: 'consumer' | 'brand';
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  identifier: string;
  type: 'consumer' | 'brand';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(Consumer)
    private readonly consumerRepo: Repository<Consumer>,
    @InjectRepository(BrandAccount)
    private readonly brandRepo: Repository<BrandAccount>,
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

    throw new UnauthorizedException('Invalid token type');
  }
}
