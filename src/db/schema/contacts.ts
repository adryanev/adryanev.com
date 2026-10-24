import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { boolean, createdAt, id } from './columns'

export const contacts = sqliteTable('contacts', {
  id: id(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject'),
  message: text('message').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: createdAt(),
}, (table) => [
  index('contacts_created_at_idx').on(table.createdAt),
])
