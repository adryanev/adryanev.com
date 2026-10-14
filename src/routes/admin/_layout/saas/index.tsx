import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSaasListings, deleteSaasListing } from '@/server/functions/saas.functions'

import { FormError } from '@/components/admin/form/FormError'
export const Route = createFileRoute('/admin/_layout/saas/')({
  loader: () => getSaasListings(),
  component: SaasListPage,
})

const statusColors = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  beta: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  retired: 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]',
}

function SaasListPage() {
  const listings = Route.useLoaderData()
  const router = useRouter()

  const deleteFn = useServerFn(deleteSaasListing)
  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteFn({ data: { id } }),
    onSuccess: () => router.invalidate(),
  })

  return (
    <div>
      <FormError message={deleteMut.isError ? 'The item could not be removed. Please try again.' : ''} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">SaaS Listings</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Manage your SaaS products</p>
        </div>
        <Link to="/admin/saas/new" className={cn('flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium', 'bg-accent text-[var(--accent-fg)] hover:bg-accent-hover')}>
          <Plus className="h-4 w-4" /> New Listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="mt-12 text-center text-[var(--text-secondary)]">No SaaS listings yet.</div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-[var(--border-color)]" role="region" aria-label="Products table, scroll for all columns" tabIndex={0}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)] border-[var(--border-color)] bg-[var(--bg-secondary)]">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium ">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((item) => (
                <tr key={item.id} className="border-b border-[var(--border-color)]">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 ">
                    <span className={cn('inline-block rounded-full px-2.5 py-0.5 text-xs font-medium', statusColors[item.status])}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link aria-label={`Edit ${item.name}`} to="/admin/saas/$id/edit" params={{ id: String(item.id) }} className="rounded p-1 text-[var(--text-secondary)] hover:text-[var(--admin-link)]"><Edit className="h-4 w-4" /></Link>
                      <button aria-label={`Delete ${item.name}`} disabled={deleteMut.isPending} onClick={() => { if (confirm('Delete?')) deleteMut.mutate(item.id) }} className="rounded p-1 text-[var(--text-secondary)] hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
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
