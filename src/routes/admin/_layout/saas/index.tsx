import { createFileRoute, Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSaasListings, deleteSaasListing } from '@/server/functions/saas.functions'

export const Route = createFileRoute('/admin/_layout/saas/')({
  loader: () => getSaasListings(),
  component: SaasListPage,
})

const statusColors = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  beta: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  retired: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
}

function SaasListPage() {
  const listings = Route.useLoaderData()

  const deleteFn = useServerFn(deleteSaasListing)
  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteFn({ data: { id } }),
    onSuccess: () => Route.router?.invalidate(),
  })

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">SaaS Listings</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your SaaS products</p>
        </div>
        <Link to="/admin/saas/new" className={cn('flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium', 'bg-accent text-slate-950 hover:bg-accent-hover')}>
          <Plus className="h-4 w-4" /> New Listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="mt-12 text-center text-slate-500">No SaaS listings yet.</div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800/50">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span className={cn('inline-block rounded-full px-2.5 py-0.5 text-xs font-medium', statusColors[item.status])}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link to="/admin/saas/$id/edit" params={{ id: String(item.id) }} className="rounded p-1 text-slate-500 hover:text-accent"><Edit className="h-4 w-4" /></Link>
                      <button onClick={() => { if (confirm('Delete?')) deleteMut.mutate(item.id) }} className="rounded p-1 text-slate-500 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
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
