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
npm run db:push
npm run db:seed
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
npm run build
npm run start
```
