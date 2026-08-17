# Security Checklist

Items that must be verified before any external-facing deployment. For an internal commercial demo on a local network, items marked **[DEMO]** are acceptable as-is. Items marked **[PRE-PROD]** must be resolved before any production or investor-facing deployment.

---

## Secrets Management

- [x] **[DEMO]** `.env` is excluded from git via `.gitignore` in both `apps/api/` and `apps/dashboard/`
- [x] **[DEMO]** No secrets in `.env.example` files — all values are placeholders
- [ ] **[PRE-PROD]** Move secrets to a secrets manager (AWS Secrets Manager, Doppler, Vault) before cloud deployment
- [ ] **[PRE-PROD]** Rotate `JWT_SECRET` and `JWT_REFRESH_SECRET` before any production deployment — treat demo secrets as compromised once used in a meeting

---

## Authentication

- [x] **[DEMO]** `JWT_SECRET` ≠ `JWT_REFRESH_SECRET` — verified by `.env.example` labeling
- [x] **[DEMO]** Access tokens expire in 15 minutes
- [x] **[DEMO]** Refresh tokens expire in 7 days
- [x] **[DEMO]** Passwords hashed with bcrypt (cost factor 10)
- [ ] **[PRE-PROD]** Add refresh token rotation — currently refresh tokens are not invalidated on use
- [ ] **[PRE-PROD]** Add rate limiting to `/auth/otp/request` to prevent OTP flooding

---

## Demo Mode

- [ ] **[PRE-PROD]** `DEMO_MODE` must be `false` in any production environment
- [ ] **[PRE-PROD]** Add a startup guard that throws if `DEMO_MODE=true` and `NODE_ENV=production`
- [x] **[DEMO]** OTP bypass `0000` only activates when `DEMO_MODE=true`

---

## Admin Endpoints

- [x] **[DEMO]** `POST /admin/seed` and `POST /admin/seed/reset` are `@Public()` — intentional for demo convenience
- [ ] **[PRE-PROD]** Protect all admin endpoints with an admin JWT role or API key before any internet-exposed deployment
- [ ] **[PRE-PROD]** Remove or gate the seed/reset endpoints entirely in production

---

## Data Privacy (PDPL Compliance — ADR-04 LOCKED)

- [x] **[DEMO]** Soft-delete (`deleted_at` / `DeleteDateColumn`) implemented on `Consumer` and `BrandAccount` entities — required by PDPL
- [ ] **[PRE-PROD]** Audit all other entities for soft-delete coverage before production
- [ ] **[PRE-PROD]** Implement consumer data export endpoint (PDPL right to access)
- [ ] **[PRE-PROD]** Implement consumer data deletion endpoint (PDPL right to erasure)

---

## Network

- [x] **[DEMO]** CORS restricted to `CORS_ORIGIN` (default `http://localhost:3001`)
- [ ] **[PRE-PROD]** Restrict CORS to specific production domains before cloud deployment
- [ ] **[PRE-PROD]** Enforce HTTPS — all traffic must be TLS in production
- [ ] **[PRE-PROD]** Add helmet.js for HTTP security headers

---

## Database

- [x] **[DEMO]** SSL enabled (`rejectUnauthorized: false`) — acceptable for Supabase with trusted certificate
- [ ] **[PRE-PROD]** Set `rejectUnauthorized: true` with proper CA certificate in production
- [x] **[DEMO]** `synchronize: true` only when `NODE_ENV !== 'production'`
- [ ] **[PRE-PROD]** Set `synchronize: false` and use TypeORM migrations in production

---

## Financial Figures

Per standing founder constraint:
> "Never present any financial figure as validated — all are ILLUSTRATIVE"

- [ ] **[PRE-PROD]** All revenue, cost, and ROI figures in any demo material must include explicit "illustrative" or "estimated" labeling before investor or commercial presentation

---

## Twilio / SMS

- [x] **[DEMO]** Twilio credentials are optional — left empty in `.env.example`; `DEMO_MODE=true` bypasses SMS
- [ ] **[PRE-PROD]** Validate and store Twilio credentials securely; implement OTP expiry (currently OtpSession has no TTL enforcement at the service layer)

---

## Summary

| Category | Demo | Pre-Production |
|----------|------|---------------|
| Secrets in git | ✅ Safe | ✅ Safe |
| JWT configuration | ✅ Acceptable | Needs rotation |
| DEMO_MODE | ✅ On (intentional) | Must be OFF |
| Admin endpoints | ⚠️ Public (intentional) | Must be protected |
| PDPL soft-delete | ✅ Implemented | Needs full audit |
| CORS | ✅ Localhost only | Needs production domain |
| HTTPS | N/A (local) | Required |
| Database SSL | ✅ Enabled | Needs strict cert |
