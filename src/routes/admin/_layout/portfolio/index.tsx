import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Plus, Pencil, FolderOpen, ExternalLink } from 'lucide-react'

import {
  getCategories,
  getProjects,
  deleteProject,
  reorderProjects,
} from '@/server/functions/portfolio.functions'
import { usePersistedOrder } from '@/hooks/usePersistedOrder'
import { groupProjectsByCategory } from '@/lib/admin-groups'
import type { RowGroup } from '@/lib/admin-groups'
import { FormError, Button } from '@/components/ui'
import { ContentStatusBadge } from '@/components/admin/ContentStatusBadge'
import { DeleteAction, RowAction, RowActions } from '@/components/admin/RowActions'
import { OrderStatusNotice, SortableList } from '@/components/admin/SortableList'
import {
  AdminBar,
  GroupHeaderRow,
  ListEmpty,
  ListFoot,
  useCollapsedGroups,
} from '@/components/admin/AdminList'

export const Route = createFileRoute('/admin/_layout/portfolio/')({
  loader: async () => {
    const [projects, categories] = await Promise.all([
      getProjects(),
      getCategories(),
    ])
    return { projects, categories }
  },
  component: ProjectListPage,
})

type Project = Awaited<ReturnType<typeof getProjects>>[number]

const COLUMNS = 7

function ProjectListPage() {
  const { projects, categories } = Route.useLoaderData()
  const router = useRouter()
  const [filter, setFilter] = useState('')
  const groups = useCollapsedGroups()

  const query = filter.trim().toLowerCase()
  // sortOrder ranks projects within their category, so a filtered subset must
  // not be renumbered over its hidden siblings
  const canReorder = !query
  // Each group's array keeps its identity across renders, which the per-group
  // order state relies on to tell fresh loader data from a re-render
  const categoryGroups = useMemo(
    () =>
      groupProjectsByCategory(
        categories,
        projects.filter((project) => project.title.toLowerCase().includes(query)),
      ).filter((group) => !query || group.rows.length > 0),
    [categories, projects, query],
  )
  const groupKeys = categoryGroups.map((group) => group.key)

  const deleteFn = useServerFn(deleteProject)
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteFn({ data: { id } }),
    onSuccess: () => router.invalidate(),
  })

  const newProject = (
    <Button asChild variant="primary" size="sm">
      <Link to="/admin/portfolio/new">
        <Plus size={16} aria-hidden="true" />
        New project
      </Link>
    </Button>
  )

  return (
    <section className="admin-screen">
      <AdminBar
        title="Portfolio"
        count={projects.length}
        filter={
          projects.length > 0
            ? { value: filter, onChange: setFilter, label: 'Filter projects by title' }
            : undefined
        }
      >
        {projects.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            data-optional
            onClick={() =>
              groups.anyOpen(groupKeys)
                ? groups.collapseAll(groupKeys)
                : groups.expandAll()
            }
          >
            {groups.anyOpen(groupKeys) ? 'Collapse all' : 'Expand all'}
          </Button>
        )}
        <Button asChild variant="secondary" size="sm">
          <Link to="/admin/portfolio/categories">Categories</Link>
        </Button>
        {newProject}
      </AdminBar>
      <FormError
        message={
          deleteMutation.isError
            ? 'The project could not be removed. Try again.'
            : ''
        }
      />

      {projects.length === 0 ? (
        <ListEmpty
          icon={FolderOpen}
          title="No projects yet"
          actions={
            <>
              <Button asChild variant="secondary" size="sm">
                <Link to="/admin/portfolio/categories">New category</Link>
              </Button>
              {newProject}
            </>
          }
        >
          Add a category first, then the projects in it. The first published
          project becomes the featured case study on the home page.
        </ListEmpty>
      ) : categoryGroups.length === 0 ? (
        <p className="admin-no-match">No projects match “{filter.trim()}”.</p>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-table__handle">
                  <span className="sr-only">Order</span>
                </th>
                <th className="admin-table__thumb">
                  <span className="sr-only">Screenshot</span>
                </th>
                <th>Project</th>
                <th className="is-num">Year</th>
                <th data-optional>Role</th>
                <th className="is-num" data-optional>Screens</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            {categoryGroups.map((group) => (
              <CategoryGroup
                key={group.key}
                group={group}
                open={groups.isOpen(group.key)}
                onToggle={() => groups.toggle(group.key)}
                canReorder={canReorder}
                deletePending={deleteMutation.isPending}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
          </table>
        </div>
      )}
      {projects.length > 0 && (
        <ListFoot>
          {categories.length} categories · {projects.length} projects ·{' '}
          {canReorder
            ? 'Drag a row by its handle, or focus the handle and use the arrow keys, to reorder it within its category.'
            : 'Clear the filter to reorder.'}
        </ListFoot>
      )}
    </section>
  )
}

function CategoryGroup({
  group,
  open,
  onToggle,
  canReorder,
  deletePending,
  onDelete,
}: {
  group: RowGroup<Project>
  open: boolean
  onToggle: () => void
  canReorder: boolean
  deletePending: boolean
  onDelete: (id: number) => void
}) {
  const router = useRouter()
  const reorderFn = useServerFn(reorderProjects)
  const order = usePersistedOrder(group.rows, async (ids) => {
    await reorderFn({ data: { ids } })
    await router.invalidate()
  })

  return (
    <>
      <tbody>
        <GroupHeaderRow
          id={'category-' + group.key}
          label={group.label}
          count={group.rows.length}
          colSpan={COLUMNS}
          open={open}
          onToggle={onToggle}
          action={
            <>
              <OrderStatusNotice status={order.status} />
              <Link
                to="/admin/portfolio/new"
                search={{ categoryId: Number(group.key) }}
                className="admin-group__add"
                aria-label={'Add a project to ' + group.label}
              >
                + Add
              </Link>
            </>
          }
        />
      </tbody>
      {open && order.items.length > 0 && (
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
              <td className="admin-table__handle">{handle}</td>
              <td className="admin-table__thumb">
                {project.images[0] ? (
                  <img
                    className="admin-thumb"
                    src={project.images[0].url}
                    alt=""
                    loading="lazy"
                  />
                ) : (
                  <span className="admin-thumb" data-empty="true">
                    none
                  </span>
                )}
              </td>
              <td className="admin-table__title">
                <Link
                  to="/admin/portfolio/$id/edit"
                  params={{ id: String(project.id) }}
                >
                  {project.title}
                </Link>
                {project.status === 'draft' && (
                  <ContentStatusBadge status={project.status} />
                )}
              </td>
              <td className="is-num">{project.year}</td>
              <td className="is-muted" data-optional>{project.role}</td>
              <td
                className="is-num"
                data-optional
                data-warn={project.images.length === 0 || undefined}
              >
                {project.images.length}
              </td>
              <td>
                <RowActions>
                  <RowAction asChild label={'Edit ' + project.title}>
                    <Link
                      to="/admin/portfolio/$id/edit"
                      params={{ id: String(project.id) }}
                    >
                      <Pencil size={15} aria-hidden="true" />
                    </Link>
                  </RowAction>
                  {project.status === 'published' && (
                    <RowAction asChild label={'View ' + project.title + ' on the site'}>
                      <Link
                        to="/portfolio/$category/$slug"
                        params={{ category: project.category.slug, slug: project.slug }}
                      >
                        <ExternalLink size={15} aria-hidden="true" />
                      </Link>
                    </RowAction>
                  )}
                  <DeleteAction
                    label={'Delete ' + project.title}
                    pending={deletePending}
                    onConfirm={() => onDelete(project.id)}
                  />
                </RowActions>
              </td>
            </>
          )}
        </SortableList>
      )}
    </>
  )
}
