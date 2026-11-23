import { createServerFn } from '@tanstack/react-start'
import { eq, isNull, asc } from 'drizzle-orm'
import { db } from '@/db'
import { saasListings } from '@/db/schema/saas'
import { getCurrentUser } from '@/server/functions/auth.functions'
import { slugify } from '@/lib/slugify'
import { parseReorderInput } from '@/lib/reorder'
import { nextSortOrder, writeSortOrder } from '@/server/sort-order'

export const getSaasListings = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    return db.query.saasListings.findMany({
      where: isNull(saasListings.deletedAt),
      orderBy: asc(saasListings.sortOrder),
    })
  },
)

export const getSaasById = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    return (
      (await db.query.saasListings.findFirst({
        where: eq(saasListings.id, data.id),
      })) ?? null
    )
  })

export const createSaasListing = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      name: string
      slug?: string
      description: string
      url?: string
      githubUrl?: string
      logoUrl?: string
      technology: string[]
      status: 'active' | 'beta' | 'retired'
      sortOrder?: number
    }) => data,
  )
  .handler(async ({ data }) => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    const slug = data.slug || slugify(data.name)
    const existing = await db.query.saasListings.findFirst({
      where: eq(saasListings.slug, slug),
    })
    if (existing) throw new Error('A listing with this slug already exists')

    await db.insert(saasListings).values({
      name: data.name,
      slug,
      description: data.description,
      url: data.url,
      githubUrl: data.githubUrl,
      logoUrl: data.logoUrl,
      technology: data.technology,
      status: data.status,
      sortOrder: data.sortOrder ?? nextSortOrder(saasListings),
    })
    return { success: true }
  })

export const reorderSaasListings = createServerFn({ method: 'POST' })
  .inputValidator(parseReorderInput)
  .handler(async ({ data }) => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    await writeSortOrder(saasListings, data.ids)
    return { success: true }
  })

export const updateSaasListing = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      id: number
      name: string
      slug?: string
      description: string
      url?: string
      githubUrl?: string
      logoUrl?: string
      technology: string[]
      status: 'active' | 'beta' | 'retired'
      sortOrder?: number
    }) => data,
  )
  .handler(async ({ data }) => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    await db
      .update(saasListings)
      .set({
        name: data.name,
        slug: data.slug || slugify(data.name),
        description: data.description,
        url: data.url,
        githubUrl: data.githubUrl,
        logoUrl: data.logoUrl,
        technology: data.technology,
        status: data.status,
        sortOrder: data.sortOrder,
        updatedAt: new Date(),
      })
      .where(eq(saasListings.id, data.id))
    return { success: true }
  })

export const deleteSaasListing = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    await db
      .update(saasListings)
      .set({ deletedAt: new Date() })
      .where(eq(saasListings.id, data.id))
    return { success: true }
  })
