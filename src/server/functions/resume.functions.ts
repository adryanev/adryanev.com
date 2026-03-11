import { createServerFn } from '@tanstack/react-start'
import { eq, asc } from 'drizzle-orm'
import { db } from '@/db'
import { resumeEntries } from '@/db/schema/resume'
import { getCurrentUser } from '@/server/functions/auth.functions'

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
      location?: string
      description?: string
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

    await db.insert(resumeEntries).values({
      type: data.type,
      title: data.title,
      organization: data.organization,
      location: data.location,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      sortOrder: data.sortOrder ?? 0,
    })
    return { success: true }
  })

export const updateResumeEntry = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      id: number
      type: 'experience' | 'education' | 'certification' | 'skill'
      title: string
      organization?: string
      location?: string
      description?: string
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
        organization: data.organization,
        location: data.location,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
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
