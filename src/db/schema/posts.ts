import { index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { createdAt, id, timestamp, updatedAt } from './columns'
import { contentStatuses } from './enums'
import { postViews } from './post-views'

export const posts = sqliteTable('posts', {
  id: id(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  coverImage: text('cover_image'),
  status: text('status', { enum: contentStatuses }).notNull().default('draft'),
  publishedAt: timestamp('published_at'),
  deletedAt: timestamp('deleted_at'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  index('posts_status_published_at_idx').on(table.status, table.publishedAt),
])

export const tags = sqliteTable('tags', {
  id: id(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
})

export const postsToTags = sqliteTable(
  'posts_to_tags',
  {
    postId: integer('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    tagId: integer('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.postId, t.tagId] })],
)

export const postsRelations = relations(posts, ({ many }) => ({
  postsToTags: many(postsToTags),
  views: many(postViews),
}))

export const tagsRelations = relations(tags, ({ many }) => ({
  postsToTags: many(postsToTags),
}))

export const postsToTagsRelations = relations(postsToTags, ({ one }) => ({
  post: one(posts, { fields: [postsToTags.postId], references: [posts.id] }),
  tag: one(tags, { fields: [postsToTags.tagId], references: [tags.id] }),
}))
