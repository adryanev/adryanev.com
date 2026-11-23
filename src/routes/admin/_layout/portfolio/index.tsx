import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Plus, Pencil } from 'lucide-react'

import {
  getProjects,
  deleteProject,
  reorderProjects,
} from '@/server/functions/portfolio.functions'
import { usePersistedOrder } from '@/hooks/usePersistedOrder'
import {
  FormError,
  Button,
  Table,
  TableScroll,
  PageHeader,
  EmptyState,
  Field,
  Input,
  Select,
} from '@/components/ui'
import { ContentStatusBadge } from '@/components/admin/ContentStatusBadge'
import { DeleteAction, RowAction, RowActions } from '@/components/admin/RowActions'
import { OrderStatusNotice, SortableList } from '@/components/admin/SortableList'

export const Route = createFileRoute('/admin/_layout/portfolio/')({
  loader: () => getProjects(),
  component: ProjectListPage,
})

const ALL_CATEGORIES = 'all'

function ProjectListPage() {
  const projects = Route.useLoaderData()
  const router = useRouter()
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES)
  const [search, setSearch] = useState('')

  const categories = useMemo(() => {
    const byId = new Map(projects.map((p) => [p.category.id, p.category]))
    return [...byId.values()].sort((a, b) => a.sortOrder - b.sortOrder)
  }, [projects])

  const query = search.trim().toLowerCase()
  // Projects arrive ordered by their rank within a category; grouping by the
  // category's own rank keeps each category's projects together
  const visible = useMemo(
    () =>
      projects
        .filter(
          (project) =>
            (categoryFilter === ALL_CATEGORIES ||
              String(project.categoryId) === categoryFilter) &&
            project.title.toLowerCase().includes(query),
        )
        .sort((a, b) => a.category.sortOrder - b.category.sortOrder),
    [projects, categoryFilter, query],
  )
  // sortOrder ranks projects within a category, so only one whole category
  // can be renumbered at a time
  const canReorder = categoryFilter !== ALL_CATEGORIES && !query

  const reorderFn = useServerFn(reorderProjects)
  const order = usePersistedOrder(visible, async (ids) => {
    await reorderFn({ data: { ids } })
    await router.invalidate()
  })
  const deleteFn = useServerFn(deleteProject)
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteFn({ data: { id } }),
    onSuccess: () => router.invalidate(),
  })

  return (
    <div>
      <PageHeader>
        <div>
          <h1>Portfolio</h1>
          <p>Manage your portfolio projects.</p>
        </div>
        <div className="page-actions">
          <Button asChild variant="secondary">
            <Link to="/admin/portfolio/categories">Categories</Link>
          </Button>
          <Button asChild variant="primary">
            <Link to="/admin/portfolio/new">
              <Plus size={18} aria-hidden="true" />
              New project
            </Link>
          </Button>
        </div>
      </PageHeader>
      <FormError
        message={
          deleteMutation.isError
            ? 'The project could not be removed. Try again.'
            : ''
        }
      />

      {projects.length === 0 ? (
        <EmptyState>
          <h2>No projects yet</h2>
          <p>Create a project to show it on the portfolio.</p>
        </EmptyState>
      ) : (
        <>
          <div className="admin-toolbar">
            <Field label="Category">
              <Select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option value={ALL_CATEGORIES}>All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Search titles">
              <Input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </Field>
            <p>
              Showing {visible.length} of {projects.length} projects.{' '}
              {canReorder
                ? 'Drag a row by its handle, or focus the handle and use the arrow keys, to reorder this category.'
                : 'To reorder, choose one category and clear the search.'}
            </p>
          </div>
          <OrderStatusNotice status={order.status} />
          {visible.length === 0 ? (
            <EmptyState>
              <p>No projects match these filters.</p>
            </EmptyState>
          ) : (
            <TableScroll aria-label="Projects table, scroll for all columns">
              <Table>
                <thead>
                  <tr>
                    {canReorder && (
                      <th className="admin-grip-cell">
                        <span className="sr-only">Order</span>
                      </th>
                    )}
                    <th>Title</th>
                    <th>Category</th>
                    <th>Year</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <SortableList
                  as="tbody"
                  itemAs="tr"
                  className="admin-sortable"
                  items={order.items}
                  getKey={(project) => project.id}
                  itemLabel={(project) => project.title}
                  onMove={order.move}
                  onDrop={order.commit}
                  enabled={canReorder}
                >
                  {(project, handle) => (
                    <>
                      {canReorder && (
                        <td className="admin-grip-cell">{handle}</td>
                      )}
                      <td>
                        <Link
                          to="/admin/portfolio/$id/edit"
                          params={{ id: String(project.id) }}
                          className="font-semibold hover:underline underline-offset-4"
                        >
                          {project.title}
                        </Link>
                      </td>
                      <td>{project.category.name}</td>
                      <td>{project.year}</td>
                      <td>
                        <ContentStatusBadge status={project.status} />
                      </td>
                      <td>
                        <RowActions>
                          <RowAction asChild label={'Edit ' + project.title}>
                            <Link
                              to="/admin/portfolio/$id/edit"
                              params={{ id: String(project.id) }}
                            >
                              <Pencil size={16} aria-hidden="true" />
                            </Link>
                          </RowAction>
                          <DeleteAction
                            label={'Delete ' + project.title}
                            pending={deleteMutation.isPending}
                            onConfirm={() => deleteMutation.mutate(project.id)}
                          />
                        </RowActions>
                      </td>
                    </>
                  )}
                </SortableList>
              </Table>
            </TableScroll>
          )}
        </>
      )}
    </div>
  )
}
