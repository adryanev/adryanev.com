import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createdAt, id, updatedAt } from './columns'
import { resumeTypes } from './enums'

export const resumeEntries = sqliteTable('resume_entries', {
  id: id(),
  type: text('type', { enum: resumeTypes }).notNull(),
  title: text('title').notNull(),
  organization: text('organization'),
  organizationUrl: text('organization_url'),
  location: text('location'),
  description: text('description'),
  technology: text('technology', { mode: 'json' }).$type<string[]>(),
  // ISO calendar dates (YYYY-MM-DD)
  startDate: text('start_date'),
  endDate: text('end_date'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
})
