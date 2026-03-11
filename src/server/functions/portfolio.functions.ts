import { createServerFn } from '@tanstack/react-start'
import { eq, isNull, and, asc, desc } from 'drizzle-orm'
import { db } from '@/db'
import {
  portfolioCategories,
  portfolioProjects,
  projectImages,
} from '@/db/schema/portfolio'
import { getCurrentUser } from '@/server/functions/auth.functions'
import { slugify } from '@/lib/slugify'

// Categories
export const getCategories = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    return db.query.portfolioCategories.findMany({
      orderBy: asc(portfolioCategories.sortOrder),
      with: { projects: { where: isNull(portfolioProjects.deletedAt) } },
    })
  },
)

export const createCategory = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { name: string; slug?: string; description?: string; sortOrder?: number }) => data,
  )
  .handler(async ({ data }) => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    const slug = data.slug || slugify(data.name)
    const existing = await db.query.portfolioCategories.findFirst({
      where: eq(portfolioCategories.slug, slug),
    })
    if (existing) throw new Error('Category with this slug already exists')

    await db.insert(portfolioCategories).values({
      name: data.name,
      slug,
      description: data.description,
      sortOrder: data.sortOrder ?? 0,
    })
    return { success: true }
  })

export const updateCategory = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { id: number; name: string; slug?: string; description?: string; sortOrder?: number }) => data,
  )
  .handler(async ({ data }) => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    await db
      .update(portfolioCategories)
      .set({
        name: data.name,
        slug: data.slug || slugify(data.name),
        description: data.description,
        sortOrder: data.sortOrder,
      })
      .where(eq(portfolioCategories.id, data.id))
    return { success: true }
  })

export const deleteCategory = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    await db
      .delete(portfolioCategories)
      .where(eq(portfolioCategories.id, data.id))
    return { success: true }
  })

// Projects
export const getProjects = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    return db.query.portfolioProjects.findMany({
      where: isNull(portfolioProjects.deletedAt),
      orderBy: [asc(portfolioProjects.sortOrder), desc(portfolioProjects.createdAt)],
      with: { category: true, images: { orderBy: asc(projectImages.sortOrder) } },
    })
  },
)

export const getProjectById = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    return (
      (await db.query.portfolioProjects.findFirst({
        where: and(
          eq(portfolioProjects.id, data.id),
          isNull(portfolioProjects.deletedAt),
        ),
        with: { category: true, images: { orderBy: asc(projectImages.sortOrder) } },
      })) ?? null
    )
  })

export const createProject = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      title: string
      slug?: string
      categoryId: number
      description: string
      year: number
      role: string
      workplace: string
      technology: string[]
      githubUrl?: string
      externalUrl?: string
      status: 'draft' | 'published'
      sortOrder?: number
      images?: { url: string; alt?: string }[]
    }) => data,
  )
  .handler(async ({ data }) => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    const slug = data.slug || slugify(data.title)
    const existing = await db.query.portfolioProjects.findFirst({
      where: eq(portfolioProjects.slug, slug),
    })
    if (existing) throw new Error('A project with this slug already exists')

    const [project] = await db
      .insert(portfolioProjects)
      .values({
        title: data.title,
        slug,
        categoryId: data.categoryId,
        description: data.description,
        year: data.year,
        role: data.role,
        workplace: data.workplace,
        technology: data.technology,
        githubUrl: data.githubUrl,
        externalUrl: data.externalUrl,
        status: data.status,
        sortOrder: data.sortOrder ?? 0,
      })
      .returning()

    if (data.images?.length) {
      await db.insert(projectImages).values(
        data.images.map((img, i) => ({
          projectId: project.id,
          url: img.url,
          alt: img.alt,
          sortOrder: i,
        })),
      )
    }

    return { success: true, id: project.id }
  })

export const updateProject = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      id: number
      title: string
      slug?: string
      categoryId: number
      description: string
      year: number
      role: string
      workplace: string
      technology: string[]
      githubUrl?: string
      externalUrl?: string
      status: 'draft' | 'published'
      sortOrder?: number
      images?: { url: string; alt?: string }[]
    }) => data,
  )
  .handler(async ({ data }) => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    const slug = data.slug || slugify(data.title)

    await db
      .update(portfolioProjects)
      .set({
        title: data.title,
        slug,
        categoryId: data.categoryId,
        description: data.description,
        year: data.year,
        role: data.role,
        workplace: data.workplace,
        technology: data.technology,
        githubUrl: data.githubUrl,
        externalUrl: data.externalUrl,
        status: data.status,
        sortOrder: data.sortOrder,
        updatedAt: new Date(),
      })
      .where(eq(portfolioProjects.id, data.id))

    // Replace images
    if (data.images) {
      await db
        .delete(projectImages)
        .where(eq(projectImages.projectId, data.id))
      if (data.images.length > 0) {
        await db.insert(projectImages).values(
          data.images.map((img, i) => ({
            projectId: data.id,
            url: img.url,
            alt: img.alt,
            sortOrder: i,
          })),
        )
      }
    }

    return { success: true }
  })

export const deleteProject = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    await db
      .update(portfolioProjects)
      .set({ deletedAt: new Date() })
      .where(eq(portfolioProjects.id, data.id))
    return { success: true }
  })
