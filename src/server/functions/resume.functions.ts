import { createServerFn } from '@tanstack/react-start'
import { eq, asc } from 'drizzle-orm'
import { db } from '@/db'
import { resumeEntries } from '@/db/schema/resume'
import { getCurrentUser } from '@/server/functions/auth.functions'
import { nextSortOrder, writeSortOrder } from '@/server/sort-order'
import { parseReorderInput } from '@/lib/reorder'

export const getResumeEntries = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    return db.query.resumeEntries.findMany({
      orderBy: asc(resumeEntries.sortOrder),
    })
  },
)

export const createResumeEntry = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      type: 'experience' | 'education' | 'certification' | 'skill'
      title: string
      organization?: string
      organizationUrl?: string
      location?: string
      description?: string
      technology?: string[]
      startDate?: string
      endDate?: string
      sortOrder?: number
    }) => data,
  )
  .handler(async ({ data }) => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    const [entry] = await db
      .insert(resumeEntries)
      .values({
        type: data.type,
        title: data.title,
        organization: data.organization,
        organizationUrl: data.organizationUrl,
        location: data.location,
        description: data.description,
        technology: data.technology ?? null,
        startDate: data.startDate,
        endDate: data.endDate,
        sortOrder:
          data.sortOrder ??
          nextSortOrder(resumeEntries, eq(resumeEntries.type, data.type)),
      })
      .returning({ id: resumeEntries.id })
    return { success: true, id: entry.id }
  })

export const updateResumeEntry = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      id: number
      type: 'experience' | 'education' | 'certification' | 'skill'
      title: string
      organization?: string
      organizationUrl?: string
      location?: string
      description?: string
      technology?: string[]
      startDate?: string
      endDate?: string
      sortOrder?: number
    }) => data,
  )
  .handler(async ({ data }) => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    await db
      .update(resumeEntries)
      .set({
        type: data.type,
        title: data.title,
        organization: data.organization ?? null,
        organizationUrl: data.organizationUrl ?? null,
        location: data.location ?? null,
        description: data.description ?? null,
        technology: data.technology ?? null,
        startDate: data.startDate ?? null,
        endDate: data.endDate ?? null,
        sortOrder: data.sortOrder,
        updatedAt: new Date(),
      })
      .where(eq(resumeEntries.id, data.id))
    return { success: true }
  })

export const deleteResumeEntry = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    await db.delete(resumeEntries).where(eq(resumeEntries.id, data.id))
    return { success: true }
  })

// Takes the ids of one resume section; sortOrder ranks entries within their type
export const reorderResumeEntries = createServerFn({ method: 'POST' })
  .inputValidator(parseReorderInput)
  .handler(async ({ data }) => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    await writeSortOrder(resumeEntries, data.ids)
    return { success: true }
  })
