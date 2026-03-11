import { date, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { resumeTypeEnum } from './enums'

export const resumeEntries = pgTable('resume_entries', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  type: resumeTypeEnum('type').notNull(),
  title: text('title').notNull(),
  organization: text('organization'),
  organizationUrl: text('organization_url'),
  location: text('location'),
  description: text('description'),
  technology: text('technology').array(),
  startDate: date('start_date'),
  endDate: date('end_date'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})
