import { createFileRoute } from '@tanstack/react-router'
import { WebhookForm } from '@/components/admin/WebhookForm'
import { getWebhookById } from '@/server/functions/webhooks.functions'

export const Route = createFileRoute('/admin/_layout/webhooks/$id/edit')({
  loader: ({ params }) => getWebhookById({ data: { id: Number(params.id) } }),
  component: EditWebhookPage,
})

function EditWebhookPage() {
  const webhook = Route.useLoaderData()
  if (!webhook) return <div className="py-12 text-center text-slate-500">Webhook not found</div>

  return (
    <div>
      <h1 className="text-2xl font-bold">Edit Webhook</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Editing: {webhook.url}</p>
      <div className="mt-6">
        <WebhookForm initial={{
          id: webhook.id,
          url: webhook.url,
          events: webhook.events,
          active: webhook.active,
          secret: webhook.secret,
        }} />
      </div>
    </div>
  )
}
