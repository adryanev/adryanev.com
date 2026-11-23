import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import { MAX_RETRIES } from '@/lib/webhook-events'
import {
  getWebhookById,
  getWebhookDeliveryLogs,
} from '@/server/functions/webhooks.functions'

import {
  Button,
  Table,
  TableScroll,
  EmptyState,
  Badge,
  PageHeader,
  PageState,
} from '@/components/ui'

export const Route = createFileRoute('/admin/_layout/webhooks/$id/logs')({
  loader: async ({ params }) => {
    const id = Number(params.id)
    const [webhook, logs] = await Promise.all([
      getWebhookById({ data: { id } }),
      getWebhookDeliveryLogs({ data: { webhookId: id } }),
    ])
    return { webhook, logs }
  },
  component: WebhookLogsPage,
})

function WebhookLogsPage() {
  const { webhook, logs } = Route.useLoaderData()

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
          <h1>Delivery logs</h1>
          <p className="break-all">{webhook.url}</p>
        </div>
        <Button asChild variant="secondary">
          <Link to="/admin/webhooks">
            <ArrowLeft size={18} aria-hidden="true" /> Back to webhooks
          </Link>
        </Button>
      </PageHeader>

      {logs.length === 0 ? (
        <EmptyState>
          <h2>No deliveries yet</h2>
          <p>Delivery attempts for this webhook appear here.</p>
        </EmptyState>
      ) : (
        <TableScroll aria-label="Webhook delivery logs table, scroll for all columns">
          <Table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Result</th>
                <th>HTTP</th>
                <th>Attempt</th>
                <th>Time</th>
                <th>Response</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <Badge>{log.event}</Badge>
                  </td>
                  <td>
                    <Badge tone={log.success ? 'success' : 'danger'}>
                      {log.success ? 'Delivered' : 'Failed'}
                    </Badge>
                  </td>
                  <td>{log.statusCode ?? '—'}</td>
                  <td>
                    {log.attempt}/{MAX_RETRIES}
                  </td>
                  <td className="whitespace-nowrap text-sm">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td>
                    <span className="block max-w-xs truncate text-sm text-text-secondary">
                      {log.response?.slice(0, 100) ?? '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableScroll>
      )}
    </div>
  )
}
