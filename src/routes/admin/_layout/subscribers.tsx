import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { Users, Trash2, CheckCircle, Clock, UserMinus, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSubscribers, getSubscriberStats, deleteSubscriber } from '@/server/functions/subscribers.functions'

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

const statusConfig = {
  confirmed: { label: 'Confirmed', icon: CheckCircle, color: 'text-green-500' },
  pending: { label: 'Pending', icon: Clock, color: 'text-yellow-500' },
  unsubscribed: { label: 'Unsubscribed', icon: UserMinus, color: 'text-[var(--text-secondary)]' },
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

  return (
    <div>
      <header className="border-b border-[var(--border-color)] pb-4 mb-6">
        <h1 className="text-2xl font-bold uppercase tracking-tight flex items-center gap-2">
          <Users className="h-6 w-6" />
          Newsletter Subscribers
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {stats.confirmed} confirmed, {stats.pending} pending, {stats.total} total
        </p>
      </header>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <div className="border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Confirmed
          </span>
          <p className="mt-2 text-3xl font-bold text-green-500">{stats.confirmed}</p>
        </div>
        <div className="border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Pending
          </span>
          <p className="mt-2 text-3xl font-bold text-yellow-500">{stats.pending}</p>
        </div>
        <div className="border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Total
          </span>
          <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">{stats.total}</p>
        </div>
      </div>

      {subscribers.items.length === 0 ? (
        <div className="mt-12 text-center text-[var(--text-secondary)]">No subscribers yet.</div>
      ) : (
        <>
          <div className="border border-[var(--border-color)] bg-[var(--bg-secondary)] divide-y divide-[var(--border-color)]">
            {subscribers.items.map((sub) => {
              const cfg = statusConfig[sub.status]
              const StatusIcon = cfg.icon
              return (
                <div
                  key={sub.id}
                  className="flex items-center justify-between px-5 py-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <StatusIcon className={cn('h-4 w-4 shrink-0', cfg.color)} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {sub.email}
                        {sub.name && (
                          <span className="ml-2 text-[var(--text-secondary)]">({sub.name})</span>
                        )}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        <span className={cfg.color}>{cfg.label}</span>
                        {' · '}
                        {new Date(sub.createdAt).toLocaleDateString()}
                        {sub.confirmedAt && (
                          <> · confirmed {new Date(sub.confirmedAt).toLocaleDateString()}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Remove ${sub.email}?`)) deleteMut.mutate(sub.id)
                    }}
                    className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-red-500 shrink-0 ml-4"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {subscribers.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-xs text-[var(--text-secondary)]">
                Page {subscribers.page} of {subscribers.totalPages} ({subscribers.total} total)
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => navigate({ search: { page: page - 1 } })}
                  className="flex items-center gap-1 border border-[var(--border-color)] px-3 py-1.5 text-xs font-mono uppercase tracking-wider hover:bg-[var(--bg-secondary)] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Prev
                </button>
                <button
                  disabled={page >= subscribers.totalPages}
                  onClick={() => navigate({ search: { page: page + 1 } })}
                  className="flex items-center gap-1 border border-[var(--border-color)] px-3 py-1.5 text-xs font-mono uppercase tracking-wider hover:bg-[var(--bg-secondary)] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
