# TAJRIBTI — Benchmark Edition (Clean Build)

Built exclusively from `governance/REFERENCE_PRODUCT_BENCHMARK.md`.
No legacy code, schema, or product assumptions were carried over from any
previous TAJRIBTI implementation.

## Structure
- `api/` — Node.js + TypeScript + Express + Prisma (SQLite) backend. Single
  source of truth for business logic and authorization.
- `web/` — Thin static web clients (Consumer, Company, Operations) served by
  the API process, plus the one-page Public Website.
- `governance/` — The authoritative Benchmark document.

## Running
```
cd api
npm install
npm run db:migrate
npm run db:seed
npm run dev
```
Server listens on http://localhost:4000 and serves:
- `/` — Public one-page website
- `/app/consumer` — Consumer web journey
- `/app/company` — Company workspace
- `/app/ops` — TAJRIBTI Operations console
- `/api/*` — REST API
