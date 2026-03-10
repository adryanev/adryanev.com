import { integer, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { contentStatusEnum } from './enums'

export const posts = pgTable('posts', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  coverImage: text('cover_image'),
  status: contentStatusEnum('status').notNull().default('draft'),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const tags = pgTable('tags', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
})

export const postsToTags = pgTable(
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
}))

export const tagsRelations = relations(tags, ({ many }) => ({
  postsToTags: many(postsToTags),
}))

export const postsToTagsRelations = relations(postsToTags, ({ one }) => ({
  post: one(posts, { fields: [postsToTags.postId], references: [posts.id] }),
  tag: one(tags, { fields: [postsToTags.tagId], references: [tags.id] }),
}))
