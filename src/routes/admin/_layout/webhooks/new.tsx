import { createFileRoute } from '@tanstack/react-router'
import { WebhookForm } from '@/components/admin/WebhookForm'

export const Route = createFileRoute('/admin/_layout/webhooks/new')({
  component: () => (
    <div>
      <h1 className="text-2xl font-bold">New Webhook</h1>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">Add a new syndication endpoint</p>
      <div className="mt-6"><WebhookForm /></div>
    </div>
  ),
})
