import { createServerFn } from '@tanstack/react-start'
import { eq, desc, lt, count } from 'drizzle-orm'
import { randomBytes, createHmac } from 'crypto'
import { db } from '@/db'
import { webhooks, webhookDeliveryLogs } from '@/db/schema/webhooks'
import { getCurrentUser } from '@/server/functions/auth.functions'
import { validateWebhookUrl, WEBHOOK_EVENTS } from '@/lib/webhooks'

const MAX_WEBHOOKS = 20

export const getWebhooks = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  const rows = await db.query.webhooks.findMany({
    orderBy: desc(webhooks.createdAt),
  })
  return rows.map(({ secret, ...rest }) => rest)
})

export const getWebhookById = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    const webhook = await db.query.webhooks.findFirst({
      where: eq(webhooks.id, data.id),
    })
    if (!webhook) return null
    const { secret, ...rest } = webhook
    return rest
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

    const urlError = validateWebhookUrl(data.url)
    if (urlError) throw new Error(urlError)

    if (data.events.length === 0) throw new Error('At least one event is required')

    const invalidEvent = data.events.find(
      (e) => !(WEBHOOK_EVENTS as readonly string[]).includes(e),
    )
    if (invalidEvent) throw new Error('Invalid event type: ' + invalidEvent)

    const [{ total }] = await db.select({ total: count() }).from(webhooks)
    if (total >= MAX_WEBHOOKS) throw new Error(`Maximum of ${MAX_WEBHOOKS} webhooks allowed`)

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

    const urlError = validateWebhookUrl(data.url)
    if (urlError) throw new Error(urlError)

    if (data.events.length === 0) throw new Error('At least one event is required')

    const invalidEvent = data.events.find(
      (e) => !(WEBHOOK_EVENTS as readonly string[]).includes(e),
    )
    if (invalidEvent) throw new Error('Invalid event type: ' + invalidEvent)

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

export const getWebhookDeliveryLogs = createServerFn({ method: 'GET' })
  .inputValidator((data: { webhookId: number }) => data)
  .handler(async ({ data }) => {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    return db.query.webhookDeliveryLogs.findMany({
      where: eq(webhookDeliveryLogs.webhookId, data.webhookId),
      orderBy: desc(webhookDeliveryLogs.createdAt),
      limit: 100,
      columns: {
        id: true,
        webhookId: true,
        event: true,
        statusCode: true,
        response: true,
        attempt: true,
        success: true,
        createdAt: true,
      },
    })
  })

export const testWebhook = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    const webhook = await db.query.webhooks.findFirst({
      where: eq(webhooks.id, data.id),
    })
    if (!webhook) throw new Error('Webhook not found')

    const payload = {
      event: 'test',
      timestamp: new Date().toISOString(),
      data: { message: 'This is a test delivery' },
    }
    const body = JSON.stringify(payload)
    const signature = createHmac('sha256', webhook.secret).update(body).digest('hex')

    try {
      const res = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': 'test',
        },
        body,
        signal: AbortSignal.timeout(10_000),
      })
      const responseText = await res.text().catch(() => null)
      return {
        success: res.ok,
        statusCode: res.status,
        response: responseText?.slice(0, 500) ?? null,
      }
    } catch (err) {
      return {
        success: false,
        statusCode: null,
        response: err instanceof Error ? err.message : 'Unknown error',
      }
    }
  })

export const cleanupDeliveryLogs = createServerFn({ method: 'POST' })
  .inputValidator((data: { retentionDays?: number }) => data)
  .handler(async ({ data }) => {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    const days = data.retentionDays ?? 90
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)

    const result = await db
      .delete(webhookDeliveryLogs)
      .where(lt(webhookDeliveryLogs.createdAt, cutoff))
      .returning({ id: webhookDeliveryLogs.id })

    return { deleted: result.length }
  })
