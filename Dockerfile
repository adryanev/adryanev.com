# Stage 1: Install dependencies
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Stage 3: Production
FROM node:22-alpine AS runner
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 app
WORKDIR /app

# Nitro bundles all dependencies — only copy the output and migrations
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/src/db/migrate.mjs ./migrate.mjs

USER app
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["sh", "-c", "node migrate.mjs && exec node .output/server/index.mjs"]
