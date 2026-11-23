import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Plus, Pencil, ScrollText, Send } from 'lucide-react'

import {
  getWebhooks,
  deleteWebhook,
  testWebhook,
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
import { DeleteAction, RowAction, RowActions } from '@/components/admin/RowActions'
import { rowPresence } from '@/components/admin/motion'

export const Route = createFileRoute('/admin/_layout/webhooks/')({
  loader: () => getWebhooks(),
  component: WebhookListPage,
})

type TestResult = { webhookId: number; delivered: boolean; detail: string }

function WebhookListPage() {
  const webhooks = Route.useLoaderData()
  const router = useRouter()
  // One result at a time; any later row action replaces or clears it
  const [testResult, setTestResult] = useState<TestResult | null>(null)

  const deleteFn = useServerFn(deleteWebhook)
  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteFn({ data: { id } }),
    onSuccess: () => router.invalidate(),
  })
  const testFn = useServerFn(testWebhook)
  const testMut = useMutation({
    mutationFn: (id: number) => testFn({ data: { id } }),
    onMutate: () => setTestResult(null),
    onSuccess: (result, webhookId) =>
      setTestResult({
        webhookId,
        delivered: result.success,
        detail:
          result.statusCode !== null
            ? 'HTTP ' + result.statusCode
            : (result.response ?? 'No response'),
      }),
    onError: (error, webhookId) =>
      setTestResult({
        webhookId,
        delivered: false,
        detail: error instanceof Error ? error.message : 'Request failed',
      }),
  })

  return (
    <div>
      <PageHeader>
        <div>
          <h1>Webhooks</h1>
          <p>Manage content syndication endpoints.</p>
        </div>
        <Button asChild variant="primary">
          <Link to="/admin/webhooks/new">
            <Plus size={18} aria-hidden="true" /> New webhook
          </Link>
        </Button>
      </PageHeader>
      <FormError
        message={
          deleteMut.isError ? 'The webhook could not be removed. Try again.' : ''
        }
      />

      {webhooks.length === 0 ? (
        <EmptyState>
          <h2>No webhooks yet</h2>
          <p>Add an endpoint to syndicate new content.</p>
        </EmptyState>
      ) : (
        <TableScroll aria-label="Webhooks table, scroll for all columns">
          <Table>
            <thead>
              <tr>
                <th>URL</th>
                <th>Events</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {webhooks.map((wh) => {
                  const result =
                    testResult?.webhookId === wh.id ? testResult : null
                  const testing = testMut.isPending && testMut.variables === wh.id
                  return (
                    <motion.tr key={wh.id} {...rowPresence}>
                      <td>
                        <span className="font-semibold break-all">{wh.url}</span>
                        <p role="status" className="mt-2">
                          {testing ? (
                            <span className="admin-status">Sending test…</span>
                          ) : result ? (
                            <Badge tone={result.delivered ? 'success' : 'danger'}>
                              {(result.delivered ? 'Test delivered' : 'Test failed') +
                                ' · ' +
                                result.detail}
                            </Badge>
                          ) : null}
                        </p>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {wh.events.map((event) => (
                            <Badge key={event}>{event}</Badge>
                          ))}
                        </div>
                      </td>
                      <td>
                        <Badge tone={wh.active ? 'success' : 'neutral'}>
                          {wh.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        <RowActions>
                          <RowAction
                            label={'Send test to ' + wh.url}
                            disabled={testMut.isPending}
                            onClick={() => testMut.mutate(wh.id)}
                          >
                            <Send size={16} aria-hidden="true" />
                          </RowAction>
                          <RowAction asChild label={'Delivery logs for ' + wh.url}>
                            <Link
                              to="/admin/webhooks/$id/logs"
                              params={{ id: String(wh.id) }}
                            >
                              <ScrollText size={16} aria-hidden="true" />
                            </Link>
                          </RowAction>
                          <RowAction asChild label={'Edit webhook ' + wh.url}>
                            <Link
                              to="/admin/webhooks/$id/edit"
                              params={{ id: String(wh.id) }}
                            >
                              <Pencil size={16} aria-hidden="true" />
                            </Link>
                          </RowAction>
                          <DeleteAction
                            label={'Delete webhook ' + wh.url}
                            pending={deleteMut.isPending}
                            onConfirm={() => {
                              setTestResult(null)
                              deleteMut.mutate(wh.id)
                            }}
                          />
                        </RowActions>
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </tbody>
          </Table>
        </TableScroll>
      )}
    </div>
  )
}
