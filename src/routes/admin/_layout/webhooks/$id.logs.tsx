import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react'

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
      <PageHeader className="justify-start">
        <Button asChild variant="ghost" size="icon">
          <Link to="/admin/webhooks" aria-label="Back to webhooks">
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Delivery Logs</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)] break-all">
            {webhook.url}
          </p>
        </div>
      </PageHeader>

      {logs.length === 0 ? (
        <EmptyState>No delivery attempts yet.</EmptyState>
      ) : (
        <TableScroll
          role="region"
          aria-label="Webhook delivery logs table, scroll for all columns"
          tabIndex={0}
        >
          <Table>
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium ">HTTP</th>
                <th className="px-4 py-3 font-medium ">Attempt</th>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium lg:table-cell">
                  Response
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-[var(--border-color)]"
                >
                  <td className="px-4 py-3">
                    {log.success ? (
                      <CheckCircle className="h-4 w-4 text-[var(--color-success)]" />
                    ) : (
                      <XCircle className="h-4 w-4 text-[var(--color-danger)]" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-[var(--bg-secondary)] border border-[var(--border-color)] px-1.5 py-0.5">
                      {log.event}
                    </code>
                  </td>
                  <td className="px-4 py-3 ">
                    <Badge
                      tone={
                        log.statusCode && log.statusCode < 400
                          ? 'success'
                          : 'danger'
                      }
                    >
                      {log.statusCode ?? '—'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3  text-[var(--text-secondary)]">
                    {log.attempt}/{MAX_RETRIES}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)] text-xs">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 lg:table-cell">
                    <span className="text-xs text-[var(--text-secondary)] truncate block max-w-xs">
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
