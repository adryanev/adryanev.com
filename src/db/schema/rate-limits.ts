import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { id, timestamp } from './columns'

export const rateLimits = sqliteTable('rate_limits', {
  id: id(),
  key: text('key').notNull().unique(),
  count: integer('count').notNull().default(1),
  resetAt: timestamp('reset_at').notNull(),
})
