import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { Plus, Pencil } from 'lucide-react'

import {
  getSaasListings,
  deleteSaasListing,
  reorderSaasListings,
} from '@/server/functions/saas.functions'
import { usePersistedOrder } from '@/hooks/usePersistedOrder'
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
import { OrderStatusNotice, SortableList } from '@/components/admin/SortableList'

export const Route = createFileRoute('/admin/_layout/saas/')({
  loader: () => getSaasListings(),
  component: SaasListPage,
})

const statusBadges = {
  active: { label: 'Active', tone: 'success' },
  beta: { label: 'Beta', tone: 'info' },
  retired: { label: 'Retired', tone: 'neutral' },
} as const

function SaasListPage() {
  const listings = Route.useLoaderData()
  const router = useRouter()
  const reorderFn = useServerFn(reorderSaasListings)
  const order = usePersistedOrder(listings, (ids) =>
    reorderFn({ data: { ids } }),
  )
  const deleteFn = useServerFn(deleteSaasListing)
  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteFn({ data: { id } }),
    onSuccess: () => router.invalidate(),
  })

  return (
    <div>
      <PageHeader>
        <div>
          <h1>SaaS listings</h1>
          <p>Manage your SaaS products.</p>
        </div>
        <Button asChild variant="primary">
          <Link to="/admin/saas/new">
            <Plus size={18} aria-hidden="true" /> New listing
          </Link>
        </Button>
      </PageHeader>
      <FormError
        message={
          deleteMut.isError ? 'The listing could not be removed. Try again.' : ''
        }
      />

      {listings.length === 0 ? (
        <EmptyState>
          <h2>No SaaS listings yet</h2>
          <p>Add a listing to show a product on the site.</p>
        </EmptyState>
      ) : (
        <>
          <OrderStatusNotice status={order.status} />
          <TableScroll aria-label="Products table, scroll for all columns">
            <Table>
              <thead>
                <tr>
                  <th className="admin-grip-cell">
                    <span className="sr-only">Order</span>
                  </th>
                  <th>Name</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <SortableList
                as="tbody"
                itemAs="tr"
                className="admin-sortable"
                items={order.items}
                getKey={(item) => item.id}
                itemLabel={(item) => item.name}
                onMove={order.move}
                onDrop={order.commit}
              >
                {(item, handle) => (
                  <>
                    <td className="admin-grip-cell">{handle}</td>
                    <td>
                      <Link
                        to="/admin/saas/$id/edit"
                        params={{ id: String(item.id) }}
                        className="font-semibold hover:underline underline-offset-4"
                      >
                        {item.name}
                      </Link>
                    </td>
                    <td>
                      <Badge tone={statusBadges[item.status].tone}>
                        {statusBadges[item.status].label}
                      </Badge>
                    </td>
                    <td>
                      <RowActions>
                        <RowAction asChild label={'Edit ' + item.name}>
                          <Link
                            to="/admin/saas/$id/edit"
                            params={{ id: String(item.id) }}
                          >
                            <Pencil size={16} aria-hidden="true" />
                          </Link>
                        </RowAction>
                        <DeleteAction
                          label={'Delete ' + item.name}
                          pending={deleteMut.isPending}
                          onConfirm={() => deleteMut.mutate(item.id)}
                        />
                      </RowActions>
                    </td>
                  </>
                )}
              </SortableList>
            </Table>
          </TableScroll>
        </>
      )}
    </div>
  )
}
