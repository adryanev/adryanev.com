import { integer, pgTable, timestamp, date, uniqueIndex } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { posts } from './posts'

export const postViews = pgTable('post_views', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  postId: integer('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  viewDate: date('view_date').notNull().defaultNow(),
  viewCount: integer('view_count').notNull().default(1),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  uniqueIndex('post_views_post_date_uniq').on(table.postId, table.viewDate),
])

export const postViewsRelations = relations(postViews, ({ one }) => ({
  post: one(posts, { fields: [postViews.postId], references: [posts.id] }),
}))
