import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  getSubscribers,
  getSubscriberStats,
  deleteSubscriber,
} from '@/server/functions/subscribers.functions'
import { formatPostDate } from '@/lib/post-dates'
import {
  FormError,
  PageHeader,
  Button,
  Panel,
  EmptyState,
  Badge,
  Table,
  TableScroll,
} from '@/components/ui'
import { DeleteAction, RowActions } from '@/components/admin/RowActions'
import { rowPresence } from '@/components/admin/motion'

export const Route = createFileRoute('/admin/_layout/subscribers')({
  validateSearch: (search: Record<string, unknown>) => ({
    page: Number(search.page) || 1,
  }),
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: async ({ deps }) => {
    const [subscribers, stats] = await Promise.all([
      getSubscribers({ data: { page: deps.page, limit: 20 } }),
      getSubscriberStats(),
    ])
    return { subscribers, stats }
  },
  component: SubscribersPage,
})

const statusBadges = {
  confirmed: { label: 'Confirmed', tone: 'success' },
  pending: { label: 'Pending', tone: 'warning' },
  unsubscribed: { label: 'Unsubscribed', tone: 'neutral' },
} as const

function SubscribersPage() {
  const { subscribers, stats } = Route.useLoaderData()
  const { page } = Route.useSearch()
  const router = useRouter()
  const navigate = Route.useNavigate()
  const deleteFn = useServerFn(deleteSubscriber)

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteFn({ data: { id } }),
    onSuccess: () => router.invalidate(),
  })

  const statCards = [
    { label: 'Confirmed', value: stats.confirmed },
    { label: 'Pending', value: stats.pending },
    { label: 'Total', value: stats.total },
  ]

  return (
    <div>
      <PageHeader>
        <div>
          <h1>Newsletter subscribers</h1>
          <p>
            {stats.confirmed} confirmed, {stats.pending} pending, {stats.total}{' '}
            total.
          </p>
        </div>
      </PageHeader>
      <FormError
        message={
          deleteMut.isError
            ? 'The subscriber could not be removed. Try again.'
            : ''
        }
      />

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {statCards.map((card) => (
          <Panel key={card.label}>
            <span className="text-sm font-semibold text-text-secondary">
              {card.label}
            </span>
            <p className="mt-2 text-3xl font-bold">{card.value}</p>
          </Panel>
        ))}
      </div>

      {subscribers.items.length === 0 ? (
        <EmptyState>
          <h2>No subscribers yet</h2>
          <p>People who sign up for the newsletter appear here.</p>
        </EmptyState>
      ) : (
        <>
          <TableScroll aria-label="Subscribers table, scroll for all columns">
            <Table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Subscribed</th>
                  <th>Confirmed</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {subscribers.items.map((sub) => (
                    <motion.tr key={sub.id} {...rowPresence}>
                      <td>
                        <span className="font-semibold break-all">
                          {sub.email}
                        </span>
                        {sub.name && (
                          <div className="mt-1 text-sm text-text-secondary">
                            {sub.name}
                          </div>
                        )}
                      </td>
                      <td>
                        <Badge tone={statusBadges[sub.status].tone}>
                          {statusBadges[sub.status].label}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap">
                        {formatPostDate(sub.createdAt)}
                      </td>
                      <td className="whitespace-nowrap">
                        {sub.confirmedAt ? formatPostDate(sub.confirmedAt) : '—'}
                      </td>
                      <td>
                        <RowActions>
                          <DeleteAction
                            label={'Remove ' + sub.email}
                            pending={deleteMut.isPending}
                            onConfirm={() => deleteMut.mutate(sub.id)}
                          />
                        </RowActions>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </Table>
          </TableScroll>

          {subscribers.totalPages > 1 && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-text-secondary">
                Page {subscribers.page} of {subscribers.totalPages} (
                {subscribers.total} total)
              </p>
              <div className="page-actions">
                <Button
                  variant="secondary"
                  disabled={page <= 1}
                  onClick={() => navigate({ search: { page: page - 1 } })}
                >
                  <ChevronLeft size={16} aria-hidden="true" /> Previous
                </Button>
                <Button
                  variant="secondary"
                  disabled={page >= subscribers.totalPages}
                  onClick={() => navigate({ search: { page: page + 1 } })}
                >
                  Next <ChevronRight size={16} aria-hidden="true" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
