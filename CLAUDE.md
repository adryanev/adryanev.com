# adryanev.com

Personal website built with TanStack Start.

## Stack

- **Framework:** TanStack Start (SSR, file-based routing)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Hosting:** Cloudflare Workers (Free plan)
- **Database:** Cloudflare D1 (SQLite) + Drizzle ORM
- **Image Storage:** Cloudflare R2, served by the Worker at `/media/*`
- **Auth:** Cookie-based sessions (PBKDF2 via WebCrypto)

## Commands

```bash
pnpm dev                # Start dev server on port 3000 (local Workers runtime, D1, R2)
pnpm build              # Production build
pnpm deploy             # Build and deploy to Cloudflare
pnpm typecheck          # TypeScript check
pnpm cf-typegen         # Regenerate worker-configuration.d.ts after editing wrangler.jsonc
pnpm db:generate        # Generate Drizzle migrations (SQL in drizzle/)
pnpm db:migrate         # Apply migrations to local D1
pnpm db:migrate:remote  # Apply migrations to production D1
pnpm db:seed            # Seed categories, posts, resume, products, contacts
pnpm db:seed-user       # Upsert admin user from ADMIN_EMAIL / ADMIN_PASSWORD
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
- **Column helpers:** Use `id()`, `timestamp()`, `createdAt()`, `updatedAt()`, `boolean()` from `src/db/schema/columns.ts`
- **Bindings:** Read D1 (`DB`), R2 (`MEDIA`) and vars through `env` from `cloudflare:workers`
- **Browser-only libraries** (three, @react-pdf, mermaid, EditorJS): load them with `createClientOnlyFn(() => import(...))` so they stay out of the Worker bundle (Free plan limit: 3 MB gzip)

## Workers Free plan limits

- 10 ms CPU per request: keep request work small; PBKDF2 is set to 25,000 iterations for this reason
- D1: at most 100 bound parameters per query; insert large row sets one statement per row with `db.batch`
- No interactive transactions on D1; use `db.batch` for atomic groups
- Background work after a response must go through `waitUntil`

## Local Development

```bash
cp .env.example .env   # Local secrets (SESSION_SECRET, admin seed credentials)
pnpm install
pnpm db:migrate        # Create local D1 tables (.wrangler/state)
pnpm db:seed           # Seed data
pnpm db:seed-user      # Create admin user
pnpm dev               # Start dev server
```
