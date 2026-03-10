# adryanev.com

Personal website built with TanStack Start.

## Stack

- **Framework:** TanStack Start (SSR, file-based routing)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** PostgreSQL + Drizzle ORM
- **Image Storage:** S3-compatible (MinIO locally)
- **Auth:** Cookie-based sessions (argon2 hashing)

## Commands

```bash
pnpm dev            # Start dev server on port 3000
pnpm build          # Production build
pnpm typecheck      # TypeScript check
pnpm db:generate    # Generate Drizzle migrations
pnpm db:migrate     # Run migrations
pnpm db:seed        # Seed admin user + categories
pnpm db:studio      # Open Drizzle Studio
```

## Conventions

- **Package manager:** pnpm
- **Code style:** No semicolons, single quotes, ESM
- **Path alias:** `@/*` → `./src/*`
- **Component pattern:** shadcn/ui style with `cn()` utility from `@/lib/utils`
- **Icons:** lucide-react
- **Server code:** `*.functions.ts` files in `src/server/functions/`
- **Middleware:** `src/server/middleware/`
- **DB schema:** Individual files in `src/db/schema/`, barrel export from `src/db/schema.ts`
- **Drizzle identity columns:** Use `generatedAlwaysAsIdentity()` (not serial)
- **Timestamps:** Use `{ withTimezone: true }` on all timestamp columns

## Local Development

```bash
docker compose up -d   # Start PostgreSQL + MinIO
cp .env.example .env   # Set up env vars
pnpm db:generate       # Generate initial migration
pnpm db:migrate        # Run migration
pnpm db:seed           # Seed data
pnpm dev               # Start dev server
```
