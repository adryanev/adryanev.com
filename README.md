# adryanev.com

Personal website for Adryan Eka Vandra — Software Engineer.

Built with [TanStack Start](https://tanstack.com/start), Cloudflare Workers + D1, and Tailwind CSS v4.

## Features

- **Resume** — Interactive career timeline + downloadable PDF
- **Portfolio** — Project case studies organized by category
- **Blog** — Technical articles with markdown rendering and syntax highlighting
- **SaaS Showcase** — Directory of active SaaS products with status indicators
- **Admin Panel** — Built-in content management with markdown editor and image uploads
- **Terminal Easter Egg** — Navigate the site via CLI commands
- **Cmd+K Palette** — Full site search and quick navigation

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | TanStack Start (SSR) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Cloudflare D1 (SQLite) |
| ORM | Drizzle |
| Image Storage | Cloudflare R2 |
| Auth | Cookie-based sessions (PBKDF2) |
| Deployment | Cloudflare Workers (Free plan) |

## Getting Started

No Docker needed: `pnpm dev` runs the Workers runtime with local D1 and R2.

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env

# Create local tables and seed
pnpm db:migrate
pnpm db:seed
pnpm db:seed-user

# Start dev server
pnpm dev
```

## Scripts

```bash
pnpm dev                # Start dev server on port 3000
pnpm build              # Production build
pnpm deploy             # Build and deploy to Cloudflare
pnpm typecheck          # TypeScript type check
pnpm db:generate        # Generate Drizzle migrations
pnpm db:migrate         # Apply migrations to local D1
pnpm db:migrate:remote  # Apply migrations to production D1
pnpm db:seed            # Seed content
pnpm db:seed-user       # Upsert admin user
```

## First production deploy

```bash
pnpm exec wrangler login
pnpm exec wrangler d1 create adryanev-com          # put the database_id into wrangler.jsonc
pnpm exec wrangler r2 bucket create adryanev-com-media
pnpm exec wrangler secret put SESSION_SECRET       # long random string
pnpm db:migrate:remote

# Seed production with the content tables of a freshly seeded local database
# (skips local sessions, sample contacts and migration bookkeeping)
ADMIN_PASSWORD='<long random password>' pnpm db:seed-user
pnpm exec wrangler d1 export DB --local --no-schema --output seed.sql \
  --table users --table site_settings --table portfolio_categories \
  --table portfolio_projects --table tags --table posts --table posts_to_tags \
  --table resume_entries --table saas_listings
pnpm exec wrangler d1 execute DB --remote --file seed.sql && rm seed.sql

pnpm deploy
```

After that, pushes to `main` deploy through GitHub Actions. The workflow needs the
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets.

## License

Private — All rights reserved.
