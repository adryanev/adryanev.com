import { createFileRoute } from '@tanstack/react-router'
import { WebhookForm } from '@/components/admin/WebhookForm'
import { getWebhookById } from '@/server/functions/webhooks.functions'
import type { WebhookEvent } from '@/lib/webhook-events'

export const Route = createFileRoute('/admin/_layout/webhooks/$id/edit')({
  loader: ({ params }) => getWebhookById({ data: { id: Number(params.id) } }),
  component: EditWebhookPage,
})

function EditWebhookPage() {
  const webhook = Route.useLoaderData()
  if (!webhook) return <div className="py-12 text-center text-[var(--text-secondary)]">Webhook not found</div>

  return (
    <div>
      <h1 className="text-2xl font-bold">Edit Webhook</h1>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">Editing: {webhook.url}</p>
      <div className="mt-6">
        <WebhookForm initial={{
          id: webhook.id,
          url: webhook.url,
          events: webhook.events as WebhookEvent[],
          active: webhook.active,
        }} />
      </div>
    </div>
  )
}
