import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { Plus, Edit, Trash2 } from 'lucide-react'

import {
  getProjects,
  deleteProject,
} from '@/server/functions/portfolio.functions'

import {
  FormError,
  Button,
  Table,
  TableScroll,
  PageHeader,
  EmptyState,
  Badge,
} from '@/components/ui'

export const Route = createFileRoute('/admin/_layout/portfolio/')({
  loader: () => getProjects(),
  component: ProjectListPage,
})

function ProjectListPage() {
  const projects = Route.useLoaderData()
  const router = useRouter()

  const deleteFn = useServerFn(deleteProject)
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteFn({ data: { id } }),
    onSuccess: () => router.invalidate(),
  })

  return (
    <div>
      <FormError
        message={
          deleteMutation.isError
            ? 'The item could not be removed. Please try again.'
            : ''
        }
      />
      <PageHeader>
        <div>
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Manage your portfolio projects
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="secondary">
            <Link to="/admin/portfolio/categories">Categories</Link>
          </Button>
          <Button asChild variant="primary">
            <Link to="/admin/portfolio/new">
              <Plus className="h-4 w-4" />
              New Project
            </Link>
          </Button>
        </div>
      </PageHeader>

      {projects.length === 0 ? (
        <EmptyState>
          <p>No projects yet.</p>
        </EmptyState>
      ) : (
        <TableScroll
          role="region"
          aria-label="Projects table, scroll for all columns"
          tabIndex={0}
        >
          <Table>
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)] border-[var(--border-color)] bg-[var(--bg-secondary)]">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium ">Category</th>
                <th className="px-4 py-3 font-medium ">Year</th>
                <th className="px-4 py-3 font-medium ">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="border-b border-[var(--border-color)]"
                >
                  <td className="px-4 py-3 font-medium">{project.title}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)] ">
                    {project.category?.name}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)] ">
                    {project.year}
                  </td>
                  <td className="px-4 py-3 ">
                    <Badge
                      tone={
                        project.status === 'published' ? 'success' : 'warning'
                      }
                    >
                      {project.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button asChild variant="ghost" size="icon">
                        <Link
                          aria-label={`Edit ${project.title}`}
                          to="/admin/portfolio/$id/edit"
                          params={{ id: String(project.id) }}
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="danger"
                        size="icon"
                        aria-label={`Delete ${project.title}`}
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                          if (confirm('Delete this project?'))
                            deleteMutation.mutate(project.id)
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
