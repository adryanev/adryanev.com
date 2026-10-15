import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { Plus, Edit, Trash2, Activity, Eye } from 'lucide-react'

import {
  getWebhooks,
  deleteWebhook,
} from '@/server/functions/webhooks.functions'

import {
  FormError,
  Button,
  Table,
  TableScroll,
  PageHeader,
  EmptyState,
  Badge,
} from '@/components/ui'

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
      <FormError
        message={
          deleteMut.isError
            ? 'The item could not be removed. Please try again.'
            : ''
        }
      />
      <PageHeader>
        <div>
          <h1 className="text-2xl font-bold">Webhooks</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Manage content syndication endpoints
          </p>
        </div>
        <Button asChild variant="primary">
          <Link to="/admin/webhooks/new">
            <Plus className="h-4 w-4" /> New Webhook
          </Link>
        </Button>
      </PageHeader>

      {webhooks.length === 0 ? (
        <EmptyState>No webhooks configured yet.</EmptyState>
      ) : (
        <TableScroll
          role="region"
          aria-label="Webhooks table, scroll for all columns"
          tabIndex={0}
        >
          <Table>
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
                <th className="px-4 py-3 font-medium">URL</th>
                <th className="px-4 py-3 font-medium ">Events</th>
                <th className="px-4 py-3 font-medium ">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {webhooks.map((wh) => (
                <tr
                  key={wh.id}
                  className="border-b border-[var(--border-color)]"
                >
                  <td className="px-4 py-3 font-medium">
                    <span className="break-all">{wh.url}</span>
                  </td>
                  <td className="px-4 py-3 ">
                    <div className="flex flex-wrap gap-1">
                      {wh.events.map((evt) => (
                        <code
                          key={evt}
                          className="text-xs bg-[var(--bg-secondary)] border border-[var(--border-color)] px-1.5 py-0.5"
                        >
                          {evt}
                        </code>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 ">
                    <Badge tone={wh.active ? 'success' : 'neutral'}>
                      <Activity className="h-3 w-3" />
                      {wh.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button asChild variant="ghost" size="icon">
                        <Link
                          to="/admin/webhooks/$id/logs"
                          params={{ id: String(wh.id) }}
                          title="Delivery logs"
                          aria-label={`Delivery logs for ${wh.url}`}
                        >
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="icon">
                        <Link
                          aria-label={`Edit webhook ${wh.url}`}
                          to="/admin/webhooks/$id/edit"
                          params={{ id: String(wh.id) }}
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="danger"
                        size="icon"
                        aria-label={`Delete webhook ${wh.url}`}
                        disabled={deleteMut.isPending}
                        onClick={() => {
                          if (confirm('Delete this webhook?'))
                            deleteMut.mutate(wh.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
