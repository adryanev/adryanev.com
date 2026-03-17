import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getWebhookById, getWebhookDeliveryLogs } from '@/server/functions/webhooks.functions'

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

  if (!webhook) return <div className="py-12 text-center text-slate-500">Webhook not found</div>

  return (
    <div>
      <div className="flex items-center gap-3">
        <Link to="/admin/webhooks" className="rounded p-1 text-slate-500 hover:text-accent">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Delivery Logs</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 break-all">{webhook.url}</p>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="mt-12 text-center text-slate-500">No delivery attempts yet.</div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">HTTP</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Attempt</th>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">Response</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-slate-100 dark:border-slate-800/50">
                  <td className="px-4 py-3">
                    {log.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-[var(--bg-secondary)] border border-[var(--border-color)] px-1.5 py-0.5">
                      {log.event}
                    </code>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span className={cn(
                      'text-xs font-medium',
                      log.statusCode && log.statusCode < 400 ? 'text-green-500' : 'text-red-500',
                    )}>
                      {log.statusCode ?? '—'}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell text-[var(--text-secondary)]">
                    {log.attempt}/3
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)] text-xs">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <span className="text-xs text-[var(--text-secondary)] truncate block max-w-xs">
                      {log.response?.slice(0, 100) ?? '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
