import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { Plus, Edit, Trash2, Activity, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getWebhooks, deleteWebhook } from '@/server/functions/webhooks.functions'

export const Route = createFileRoute('/admin/_layout/webhooks/')({
  loader: () => getWebhooks(),
  component: WebhookListPage,
})

function WebhookListPage() {
  const webhooks = Route.useLoaderData()
  const router = useRouter()

  const deleteFn = useServerFn(deleteWebhook)
  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteFn({ data: { id } }),
    onSuccess: () => router.invalidate(),
  })

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Webhooks</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage content syndication endpoints</p>
        </div>
        <Link to="/admin/webhooks/new" className={cn('flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium', 'bg-accent text-slate-950 hover:bg-accent-hover')}>
          <Plus className="h-4 w-4" /> New Webhook
        </Link>
      </div>

      {webhooks.length === 0 ? (
        <div className="mt-12 text-center text-slate-500">No webhooks configured yet.</div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                <th className="px-4 py-3 font-medium">URL</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Events</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {webhooks.map((wh) => (
                <tr key={wh.id} className="border-b border-slate-100 dark:border-slate-800/50">
                  <td className="px-4 py-3 font-medium">
                    <span className="break-all">{wh.url}</span>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {wh.events.map((evt) => (
                        <code key={evt} className="text-xs bg-[var(--bg-secondary)] border border-[var(--border-color)] px-1.5 py-0.5">
                          {evt}
                        </code>
                      ))}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
                      wh.active
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                    )}>
                      <Activity className="h-3 w-3" />
                      {wh.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link to="/admin/webhooks/$id/logs" params={{ id: String(wh.id) }} className="rounded p-1 text-slate-500 hover:text-accent" title="Delivery logs">
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link to="/admin/webhooks/$id/edit" params={{ id: String(wh.id) }} className="rounded p-1 text-slate-500 hover:text-accent">
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button onClick={() => { if (confirm('Delete this webhook?')) deleteMut.mutate(wh.id) }} className="rounded p-1 text-slate-500 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
