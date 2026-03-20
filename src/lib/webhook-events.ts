export type WebhookEvent = 'post.created' | 'post.updated' | 'post.deleted'

export const WEBHOOK_EVENTS: readonly WebhookEvent[] = [
  'post.created',
  'post.updated',
  'post.deleted',
] as const

export const MAX_RETRIES = 3
