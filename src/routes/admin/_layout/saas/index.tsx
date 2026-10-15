import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { Plus, Edit, Trash2 } from 'lucide-react'

import {
  getSaasListings,
  deleteSaasListing,
} from '@/server/functions/saas.functions'

import {
  FormError,
  Button,
  Table,
  TableScroll,
  PageHeader,
  EmptyState,
  Badge,
} from '@/components/ui'

export const Route = createFileRoute('/admin/_layout/saas/')({
  loader: () => getSaasListings(),
  component: SaasListPage,
})

const statusTones = {
  active: 'success',
  beta: 'info',
  retired: 'neutral',
} as const

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
      <FormError
        message={
          deleteMut.isError
            ? 'The item could not be removed. Please try again.'
            : ''
        }
      />
      <PageHeader>
        <div>
          <h1 className="text-2xl font-bold">SaaS Listings</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Manage your SaaS products
          </p>
        </div>
        <Button asChild variant="primary">
          <Link to="/admin/saas/new">
            <Plus className="h-4 w-4" /> New Listing
          </Link>
        </Button>
      </PageHeader>

      {listings.length === 0 ? (
        <EmptyState>No SaaS listings yet.</EmptyState>
      ) : (
        <TableScroll
          role="region"
          aria-label="Products table, scroll for all columns"
          tabIndex={0}
        >
          <Table>
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)] border-[var(--border-color)] bg-[var(--bg-secondary)]">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium ">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-[var(--border-color)]"
                >
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 ">
                    <Badge tone={statusTones[item.status]}>{item.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button asChild variant="ghost" size="icon">
                        <Link
                          aria-label={`Edit ${item.name}`}
                          to="/admin/saas/$id/edit"
                          params={{ id: String(item.id) }}
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="danger"
                        size="icon"
                        aria-label={`Delete ${item.name}`}
                        disabled={deleteMut.isPending}
                        onClick={() => {
                          if (confirm('Delete?')) deleteMut.mutate(item.id)
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
