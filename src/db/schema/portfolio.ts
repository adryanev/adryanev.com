import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { contentStatusEnum } from './enums'

export const portfolioCategories = pgTable('portfolio_categories', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const portfolioProjects = pgTable('portfolio_projects', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  categoryId: integer('category_id')
    .notNull()
    .references(() => portfolioCategories.id),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  year: integer('year').notNull(),
  role: text('role').notNull(),
  workplace: text('workplace').notNull(),
  technology: text('technology').array().notNull(),
  githubUrl: text('github_url'),
  externalUrl: text('external_url'),
  status: contentStatusEnum('status').notNull().default('draft'),
  sortOrder: integer('sort_order').notNull().default(0),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  index('portfolio_projects_status_idx').on(table.status),
])

export const projectImages = pgTable('project_images', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  projectId: integer('project_id')
    .notNull()
    .references(() => portfolioProjects.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  alt: text('alt'),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const portfolioCategoriesRelations = relations(
  portfolioCategories,
  ({ many }) => ({
    projects: many(portfolioProjects),
  }),
)

export const portfolioProjectsRelations = relations(
  portfolioProjects,
  ({ one, many }) => ({
    category: one(portfolioCategories, {
      fields: [portfolioProjects.categoryId],
      references: [portfolioCategories.id],
    }),
    images: many(projectImages),
  }),
)

export const projectImagesRelations = relations(projectImages, ({ one }) => ({
  project: one(portfolioProjects, {
    fields: [projectImages.projectId],
    references: [portfolioProjects.id],
  }),
}))
