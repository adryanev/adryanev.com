import { createHmac } from 'crypto'
import { waitUntil } from 'cloudflare:workers'
import { and, eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import { webhooks, webhookDeliveryLogs } from '@/db/schema/webhooks'
import { MAX_RETRIES, type WebhookEvent } from '@/lib/webhook-events'

export { type WebhookEvent, WEBHOOK_EVENTS, MAX_RETRIES } from '@/lib/webhook-events'
const MAX_CONCURRENT_DELIVERIES = 5
const ATTEMPT_TIMEOUT_MS = 10_000
// waitUntil work is cancelled 30 s after the response; finish (and log) before that
const DELIVERY_BUDGET_MS = 25_000
const MIN_ATTEMPT_MS = 1_000

type WebhookPayload = {
  event: WebhookEvent
  timestamp: string
  data: Record<string, unknown>
}

function signPayload(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex')
}

const BLOCKED_IP_PREFIXES = [
  '127.', '10.', '0.', '169.254.',
  '192.168.',
]
const BLOCKED_IP_STARTS_172 = { min: 16, max: 31 }

function isPrivateIp(hostname: string): boolean {
  if (hostname === 'localhost' || hostname === '[::1]') return true
  if (BLOCKED_IP_PREFIXES.some((p) => hostname.startsWith(p))) return true
  if (hostname.startsWith('172.')) {
    const second = parseInt(hostname.split('.')[1], 10)
    if (second >= BLOCKED_IP_STARTS_172.min && second <= BLOCKED_IP_STARTS_172.max) return true
  }
  return false
}

export function validateWebhookUrl(url: string): string | null {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return 'Invalid URL format'
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return 'URL must use https:// or http://'
  }

  if (isPrivateIp(parsed.hostname)) {
    return 'URL must not point to private or internal addresses'
  }

  return null
}

async function deliverWebhook(
  webhookId: number,
  url: string,
  secret: string,
  payload: WebhookPayload,
  deadline: number,
) {
  const body = JSON.stringify(payload)
  const signature = signPayload(body, secret)

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const remainingMs = deadline - Date.now()
    if (remainingMs < MIN_ATTEMPT_MS) return

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
        signal: AbortSignal.timeout(Math.min(ATTEMPT_TIMEOUT_MS, remainingMs)),
      })

      statusCode = res.status
      responseText = await res.text().catch(() => null)
      success = res.ok
    } catch (err) {
      responseText = err instanceof Error ? err.message : 'Unknown error'
    }

    try {
      await db.insert(webhookDeliveryLogs).values({
        webhookId,
        event: payload.event,
        payload: body,
        statusCode,
        response: responseText?.slice(0, 2000) ?? null,
        attempt,
        success,
      })
    } catch {
      // Webhook may have been deleted mid-delivery; skip logging
      return
    }

    if (success) return

    // Exponential backoff: 1s, 4s, 9s, unless it would run past the deadline
    const backoffMs = attempt * attempt * 1000
    const hasTimeForRetry = deadline - Date.now() - backoffMs >= MIN_ATTEMPT_MS
    if (attempt === MAX_RETRIES || !hasTimeForRetry) return
    await new Promise((r) => setTimeout(r, backoffMs))
  }
}

export function fireWebhooks(event: WebhookEvent, data: Record<string, unknown>) {
  // Fire-and-forget: waitUntil keeps the Worker alive after the response is sent
  waitUntil((async () => {
    const deadline = Date.now() + DELIVERY_BUDGET_MS
    try {
      const matching = await db.query.webhooks.findMany({
        where: and(
          eq(webhooks.active, true),
          sql`exists (select 1 from json_each(${webhooks.events}) where value = ${event})`,
        ),
      })

      if (matching.length === 0) return

      const payload: WebhookPayload = {
        event,
        timestamp: new Date().toISOString(),
        data,
      }

      // Limit concurrency to avoid overwhelming the server
      const batches = []
      for (let i = 0; i < matching.length; i += MAX_CONCURRENT_DELIVERIES) {
        batches.push(matching.slice(i, i + MAX_CONCURRENT_DELIVERIES))
      }
      for (const batch of batches) {
        await Promise.allSettled(
          batch.map((wh) => deliverWebhook(wh.id, wh.url, wh.secret, payload, deadline)),
        )
      }
    } catch (err) {
      console.error('[webhooks] delivery error:', err)
    }
  })())
}
