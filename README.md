# adryanev.com

Personal website for Adryan Eka Vandra — Software Engineer.

Built with [TanStack Start](https://tanstack.com/start), PostgreSQL, and Tailwind CSS v4.

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
| Database | PostgreSQL |
| ORM | Drizzle |
| Image Storage | S3-compatible (MinIO / R2) |
| Auth | Cookie-based sessions (argon2) |
| Deployment | Dokploy (self-hosted VPS) |

## Getting Started

```bash
# Install dependencies
pnpm install

# Start local services
docker compose up -d

# Set up environment
cp .env.example .env

# Run database migrations and seed
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# Start dev server
pnpm dev
```

## Scripts

```bash
pnpm dev            # Start dev server on port 3000
pnpm build          # Production build
pnpm typecheck      # TypeScript type check
pnpm db:generate    # Generate Drizzle migrations
pnpm db:migrate     # Run migrations
pnpm db:seed        # Seed admin user + categories
pnpm db:studio      # Open Drizzle Studio
```

## License

Private — All rights reserved.
