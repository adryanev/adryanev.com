import { createFileRoute } from '@tanstack/react-router'
import { WebhookForm } from '@/components/admin/WebhookForm'
import { getWebhookById } from '@/server/functions/webhooks.functions'
import type { WebhookEvent } from '@/lib/webhook-events'

import { PageHeader, PageState } from '@/components/ui'

export const Route = createFileRoute('/admin/_layout/webhooks/$id/edit')({
  loader: ({ params }) => getWebhookById({ data: { id: Number(params.id) } }),
  component: EditWebhookPage,
})

function EditWebhookPage() {
  const webhook = Route.useLoaderData()
  if (!webhook)
    return (
      <PageState>
        <h1>Webhook not found</h1>
        <p>Return to the collection to choose another entry.</p>
      </PageState>
    )

  return (
    <div>
      <PageHeader>
        <div>
          <h1 className="text-2xl font-bold">Edit Webhook</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Editing: {webhook.url}
          </p>
        </div>
      </PageHeader>
      <div className="mt-6">
        <WebhookForm
          initial={{
            id: webhook.id,
            url: webhook.url,
            events: webhook.events as WebhookEvent[],
            active: webhook.active,
          }}
        />
      </div>
    </div>
  )
}
