import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createdAt, id, timestamp } from './columns'
import { subscriberStatuses } from './enums'

export const subscribers = sqliteTable('subscribers', {
  id: id(),
  email: text('email').notNull().unique(),
  name: text('name'),
  status: text('status', { enum: subscriberStatuses }).notNull().default('pending'),
  confirmToken: text('confirm_token').notNull(),
  unsubscribeToken: text('unsubscribe_token').notNull(),
  tokenExpiresAt: timestamp('token_expires_at').notNull(),
  confirmedAt: timestamp('confirmed_at'),
  unsubscribedAt: timestamp('unsubscribed_at'),
  createdAt: createdAt(),
}, (table) => [
  index('subscribers_status_idx').on(table.status),
  index('subscribers_confirm_token_idx').on(table.confirmToken),
  index('subscribers_unsubscribe_token_idx').on(table.unsubscribeToken),
])
