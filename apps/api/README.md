# Tajribti API

NestJS backend for the Tajribti Commercial Demo. Provides authentication, campaign management, QR redemption, survey collection, analytics, and AI-powered reporting.

## Quick Start

```bash
cp .env.example .env      # fill in DATABASE_URL and JWT secrets
npm install               # already done if cloned fresh with node_modules
npm run start:dev         # starts on http://localhost:3000
```

After the server is running, seed demo data:

```bash
curl -X POST http://localhost:3000/api/v1/admin/seed
```

## Ports

| Service | Port |
|---------|------|
| API     | 3000 |
| Prefix  | /api/v1 |

## Key Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | /auth/brand/login | None | Brand dashboard login |
| POST | /auth/otp/request | None | Consumer OTP request |
| POST | /auth/otp/verify | None | Consumer OTP verify (returns JWT) |
| POST | /auth/register | JWT | Consumer registration |
| GET | /campaigns/demo/active | JWT | Active demo campaign |
| GET | /qr/generate/:campaignId | JWT | QR PNG image |
| POST | /qr/redeem | JWT | Redeem QR code |
| POST | /survey/submit | JWT | Submit survey answers |
| GET | /analytics/:id/overview | JWT | Campaign overview |
| GET | /analytics/:id/demographics | JWT | Demographics breakdown |
| GET | /analytics/:id/survey | JWT | Survey results |
| GET | /analytics/:id/participants | JWT | Participant list (paged) |
| GET | /report/:id/ai-summary | JWT | AI narrative |
| GET | /report/:id/pdf-data | JWT | Full PDF data |
| POST | /admin/seed | None | Seed 49 demo consumers |
| POST | /admin/seed/reset | None | Reset demo data |

## Environment Variables

See `.env.example` for all required and optional variables.

## Scripts

```bash
npm run start:dev     # development with hot reload
npm run build         # compile to dist/
npm run start         # run compiled dist/main.js
npm run lint          # ESLint with auto-fix
npm run test          # Jest (no test files exist yet)
```

## Architecture

- **Framework:** NestJS 10, TypeScript
- **ORM:** TypeORM 0.3, PostgreSQL
- **Auth:** JWT (15m access / 7d refresh), OTP phone auth
- **Validation:** class-validator, `forbidNonWhitelisted: true`
- **Response shape:** All responses wrapped `{ success, data, timestamp }` via TransformInterceptor
- **Demo mode:** `DEMO_MODE=true` enables OTP code "0000" for any phone number

See `docs/deployment/` in the repository root for full setup instructions.
