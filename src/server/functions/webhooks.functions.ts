import { createServerFn } from '@tanstack/react-start'
import { eq, desc } from 'drizzle-orm'
import { randomBytes } from 'crypto'
import { db } from '@/db'
import { webhooks, webhookDeliveryLogs } from '@/db/schema/webhooks'
import { getCurrentUser } from '@/server/functions/auth.functions'

export const getWebhooks = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  return db.query.webhooks.findMany({
    orderBy: desc(webhooks.createdAt),
  })
})

export const getWebhookById = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    const webhook = await db.query.webhooks.findFirst({
      where: eq(webhooks.id, data.id),
    })
    return webhook ?? null
  })

export const createWebhook = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      url: string
      events: string[]
      active: boolean
    }) => data,
  )
  .handler(async ({ data }) => {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    if (!data.url) throw new Error('URL is required')
    if (data.events.length === 0) throw new Error('At least one event is required')

    const secret = randomBytes(32).toString('hex')

    const [webhook] = await db
      .insert(webhooks)
      .values({
        url: data.url,
        secret,
        events: data.events,
        active: data.active,
      })
      .returning()

    return { success: true, id: webhook.id, secret }
  })

export const updateWebhook = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      id: number
      url: string
      events: string[]
      active: boolean
    }) => data,
  )
  .handler(async ({ data }) => {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    if (!data.url) throw new Error('URL is required')
    if (data.events.length === 0) throw new Error('At least one event is required')

    await db
      .update(webhooks)
      .set({
        url: data.url,
        events: data.events,
        active: data.active,
        updatedAt: new Date(),
      })
      .where(eq(webhooks.id, data.id))

    return { success: true }
  })

export const deleteWebhook = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    await db.delete(webhooks).where(eq(webhooks.id, data.id))
    return { success: true }
  })

export const regenerateWebhookSecret = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    const secret = randomBytes(32).toString('hex')
    await db
      .update(webhooks)
      .set({ secret, updatedAt: new Date() })
      .where(eq(webhooks.id, data.id))

    return { success: true, secret }
  })

export const getWebhookDeliveryLogs = createServerFn({ method: 'GET' })
  .inputValidator((data: { webhookId: number }) => data)
  .handler(async ({ data }) => {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    return db.query.webhookDeliveryLogs.findMany({
      where: eq(webhookDeliveryLogs.webhookId, data.webhookId),
      orderBy: desc(webhookDeliveryLogs.createdAt),
      limit: 100,
    })
  })
