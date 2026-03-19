import { boolean, index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const webhooks = pgTable('webhooks', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  url: text('url').notNull(),
  secret: text('secret').notNull(),
  events: text('events').array().notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const webhookDeliveryLogs = pgTable('webhook_delivery_logs', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  webhookId: integer('webhook_id')
    .notNull()
    .references(() => webhooks.id, { onDelete: 'cascade' }),
  event: text('event').notNull(),
  payload: text('payload').notNull(),
  statusCode: integer('status_code'),
  response: text('response'),
  attempt: integer('attempt').notNull().default(1),
  success: boolean('success').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  index('webhook_delivery_logs_webhook_id_created_idx').on(table.webhookId, table.createdAt),
])

export const webhooksRelations = relations(webhooks, ({ many }) => ({
  deliveryLogs: many(webhookDeliveryLogs),
}))

export const webhookDeliveryLogsRelations = relations(webhookDeliveryLogs, ({ one }) => ({
  webhook: one(webhooks, { fields: [webhookDeliveryLogs.webhookId], references: [webhooks.id] }),
}))
