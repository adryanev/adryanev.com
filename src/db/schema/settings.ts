import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { updatedAt } from './columns'

export const siteSettings = sqliteTable('site_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: updatedAt(),
})
