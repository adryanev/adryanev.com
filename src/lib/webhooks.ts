import { createHmac } from 'crypto'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { webhooks, webhookDeliveryLogs } from '@/db/schema/webhooks'

export type WebhookEvent = 'post.created' | 'post.updated' | 'post.deleted'

type WebhookPayload = {
  event: WebhookEvent
  timestamp: string
  data: Record<string, unknown>
}

function signPayload(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex')
}

async function deliverWebhook(
  webhookId: number,
  url: string,
  secret: string,
  payload: WebhookPayload,
  maxRetries = 3,
) {
  const body = JSON.stringify(payload)
  const signature = signPayload(body, secret)

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    let statusCode: number | null = null
    let responseText: string | null = null
    let success = false

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': payload.event,
        },
        body,
        signal: AbortSignal.timeout(10_000),
      })

      statusCode = res.status
      responseText = await res.text().catch(() => null)
      success = res.ok
    } catch (err) {
      responseText = err instanceof Error ? err.message : 'Unknown error'
    }

    await db.insert(webhookDeliveryLogs).values({
      webhookId,
      event: payload.event,
      payload: body,
      statusCode,
      response: responseText?.slice(0, 2000) ?? null,
      attempt,
      success,
    })

    if (success) return

    // Exponential backoff: 1s, 4s, 9s
    if (attempt < maxRetries) {
      await new Promise((r) => setTimeout(r, attempt * attempt * 1000))
    }
  }
}

export async function fireWebhooks(event: WebhookEvent, data: Record<string, unknown>) {
  const activeWebhooks = await db.query.webhooks.findMany({
    where: eq(webhooks.active, true),
  })

  const matching = activeWebhooks.filter((wh) => wh.events.includes(event))
  if (matching.length === 0) return

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  }

  // Fire all deliveries concurrently, don't block the caller
  Promise.allSettled(
    matching.map((wh) => deliverWebhook(wh.id, wh.url, wh.secret, payload)),
  ).catch(() => {
    // Swallow errors — delivery logs capture failures
  })
}
