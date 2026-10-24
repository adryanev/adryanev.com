import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { createdAt, id } from './columns'
import { posts } from './posts'

export const postViews = sqliteTable('post_views', {
  id: id(),
  postId: integer('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  // ISO calendar date (YYYY-MM-DD) in UTC
  viewDate: text('view_date').notNull(),
  viewCount: integer('view_count').notNull().default(1),
  createdAt: createdAt(),
}, (table) => [
  uniqueIndex('post_views_post_date_uniq').on(table.postId, table.viewDate),
])

export const postViewsRelations = relations(postViews, ({ one }) => ({
  post: one(posts, { fields: [postViews.postId], references: [posts.id] }),
}))
