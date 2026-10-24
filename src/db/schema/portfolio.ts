import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { createdAt, id, timestamp, updatedAt } from './columns'
import { contentStatuses } from './enums'

export const portfolioCategories = sqliteTable('portfolio_categories', {
  id: id(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const portfolioProjects = sqliteTable('portfolio_projects', {
  id: id(),
  categoryId: integer('category_id')
    .notNull()
    .references(() => portfolioCategories.id),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  year: integer('year').notNull(),
  role: text('role').notNull(),
  workplace: text('workplace').notNull(),
  technology: text('technology', { mode: 'json' }).$type<string[]>().notNull(),
  githubUrl: text('github_url'),
  externalUrl: text('external_url'),
  status: text('status', { enum: contentStatuses }).notNull().default('draft'),
  sortOrder: integer('sort_order').notNull().default(0),
  deletedAt: timestamp('deleted_at'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  index('portfolio_projects_status_idx').on(table.status),
])

export const projectImages = sqliteTable('project_images', {
  id: id(),
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
