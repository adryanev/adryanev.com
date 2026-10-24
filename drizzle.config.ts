import { defineConfig } from 'drizzle-kit'

// Generates SQL only; wrangler applies it (`wrangler d1 migrations apply`)
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
})
