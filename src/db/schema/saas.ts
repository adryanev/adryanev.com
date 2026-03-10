import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { saasStatusEnum } from './enums'

export const saasListings = pgTable('saas_listings', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  url: text('url'),
  githubUrl: text('github_url'),
  logoUrl: text('logo_url'),
  technology: text('technology').array().notNull(),
  status: saasStatusEnum('status').notNull().default('active'),
  sortOrder: integer('sort_order').notNull().default(0),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})
