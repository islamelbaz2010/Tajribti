import { ForbiddenException } from '@nestjs/common';
import { AuthenticatedUser } from './strategies/jwt.strategy';

// Founder ruling W-1 (2026-09-02): every controller that used to check
// `req.user.type !== 'brand'` and then use `req.user.id` directly as the
// owning Company's id now goes through this single helper instead. A
// BrandAccount ('brand') is scoped by its own id, exactly as before; a
// CompanyEmployee ('employee') is scoped by the brandAccountId carried in
// its JWT (see jwt.strategy.ts) — same Company-scoped access the
// BrandAccount owner already has, no separate permission matrix. Any
// other token type (consumer, admin) is rejected the same way a
// non-brand token always was.
//
// This is the one place that decision lives, so extending Company-scoped
// access to employees never required touching each controller's business
// logic — only this resolution step.
export function resolveCompanyId(user: AuthenticatedUser): string {
  if (user.type === 'brand') return user.id;
  if (user.type === 'employee') {
    if (!user.companyId) throw new ForbiddenException('Company account required');
    return user.companyId;
  }
  throw new ForbiddenException('Company account required');
}
