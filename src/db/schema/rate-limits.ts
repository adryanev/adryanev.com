import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const rateLimits = pgTable('rate_limits', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  key: text('key').notNull().unique(),
  count: integer('count').notNull().default(1),
  resetAt: timestamp('reset_at', { withTimezone: true }).notNull(),
})
