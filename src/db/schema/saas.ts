import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createdAt, id, timestamp, updatedAt } from './columns'
import { saasStatuses } from './enums'

export const saasListings = sqliteTable('saas_listings', {
  id: id(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  url: text('url'),
  githubUrl: text('github_url'),
  logoUrl: text('logo_url'),
  technology: text('technology', { mode: 'json' }).$type<string[]>().notNull(),
  status: text('status', { enum: saasStatuses }).notNull().default('active'),
  sortOrder: integer('sort_order').notNull().default(0),
  deletedAt: timestamp('deleted_at'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
})
