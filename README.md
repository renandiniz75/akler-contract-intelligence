# Akler Contract Intelligence

MVP for managing public-sector contracts, contract items, CAPEX, OPEX, revenue projections, realized revenue, and executive cash-flow intelligence.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style primitives
- PostgreSQL
- Drizzle ORM
- Recharts
- Auth.js prepared
- Render-ready environment variables

## Local Setup

```bash
cp .env.example .env
npm install
npm run db:setup
npm run dev
```

## Render

Set these environment variables in Render:

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_TRUST_HOST=true`
- `NEXT_PUBLIC_APP_URL`

Use:

```bash
npm install
npm run render-build
npm run start
```

## Data Flow

The app reads from PostgreSQL when `DATABASE_URL` is configured. Without it, pages fall back to the built-in seed data so the MVP can still build and render before infrastructure exists.

The seeded contracts use deterministic IDs for Linhares, Aracruz and Itapemirim, which keeps demo forms and financial records aligned across local and deployed environments.
