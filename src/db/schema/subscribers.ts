import { index, integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const subscriberStatusEnum = pgEnum('subscriber_status', [
  'pending',
  'confirmed',
  'unsubscribed',
])

export const subscribers = pgTable('subscribers', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  email: text('email').notNull().unique(),
  name: text('name'),
  status: subscriberStatusEnum('status').notNull().default('pending'),
  confirmToken: text('confirm_token').notNull(),
  unsubscribeToken: text('unsubscribe_token').notNull(),
  tokenExpiresAt: timestamp('token_expires_at', { withTimezone: true }).notNull(),
  confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
  unsubscribedAt: timestamp('unsubscribed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  index('subscribers_status_idx').on(table.status),
  index('subscribers_confirm_token_idx').on(table.confirmToken),
  index('subscribers_unsubscribe_token_idx').on(table.unsubscribeToken),
])
