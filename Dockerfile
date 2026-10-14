# Shared toolchain; Corepack reads the pinned packageManager from package.json.
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

# Stage 1: Install dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN pnpm build
RUN pnpm typecheck && pnpm exec tsx --test --test-concurrency=1 tests/*.test.ts

# Stage 3: Production
FROM node:22-alpine AS runner
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 app
WORKDIR /app

# Nitro bundles all dependencies — only copy the output and migrations
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/src/db/migrate.mjs ./migrate.mjs

# Install only migration dependencies (drizzle-orm + pg)
RUN npm install --no-save drizzle-orm pg

USER app
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["sh", "-c", "node migrate.mjs && exec node .output/server/index.mjs"]
