import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { boolean, createdAt, id, updatedAt } from './columns'

export const webhooks = sqliteTable('webhooks', {
  id: id(),
  url: text('url').notNull(),
  secret: text('secret').notNull(),
  events: text('events', { mode: 'json' }).$type<string[]>().notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
})

export const webhookDeliveryLogs = sqliteTable('webhook_delivery_logs', {
  id: id(),
  webhookId: integer('webhook_id')
    .notNull()
    .references(() => webhooks.id, { onDelete: 'cascade' }),
  event: text('event').notNull(),
  payload: text('payload').notNull(),
  statusCode: integer('status_code'),
  response: text('response'),
  attempt: integer('attempt').notNull().default(1),
  success: boolean('success').notNull().default(false),
  createdAt: createdAt(),
}, (table) => [
  index('webhook_delivery_logs_webhook_id_created_idx').on(table.webhookId, table.createdAt),
])

export const webhooksRelations = relations(webhooks, ({ many }) => ({
  deliveryLogs: many(webhookDeliveryLogs),
}))

export const webhookDeliveryLogsRelations = relations(webhookDeliveryLogs, ({ one }) => ({
  webhook: one(webhooks, { fields: [webhookDeliveryLogs.webhookId], references: [webhooks.id] }),
}))
