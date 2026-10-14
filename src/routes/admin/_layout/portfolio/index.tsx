import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getProjects, deleteProject } from '@/server/functions/portfolio.functions'

import { FormError } from '@/components/admin/form/FormError'
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
      <FormError message={deleteMutation.isError ? 'The item could not be removed. Please try again.' : ''} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Manage your portfolio projects
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/portfolio/categories"
            className="rounded-md border border-[var(--border-color)] px-4 py-2 text-sm bg-[var(--bg-secondary)] border-[var(--border-color)] bg-[var(--bg-secondary)]"
          >
            Categories
          </Link>
          <Link
            to="/admin/portfolio/new"
            className={cn(
              'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium',
              'bg-accent text-[var(--accent-fg)] hover:bg-accent-hover',
            )}
          >
            <Plus className="h-4 w-4" />
            New Project
          </Link>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="mt-12 text-center text-[var(--text-secondary)]">
          <p>No projects yet.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-[var(--border-color)]" role="region" aria-label="Projects table, scroll for all columns" tabIndex={0}>
          <table className="w-full text-left text-sm">
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
                    <span
                      className={cn(
                        'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
                        project.status === 'published'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                      )}
                    >
                      {project.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        aria-label={`Edit ${project.title}`}
                        to="/admin/portfolio/$id/edit"
                        params={{ id: String(project.id) }}
                        className="rounded p-1 text-[var(--text-secondary)] hover:text-[var(--admin-link)]"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        aria-label={`Delete ${project.title}`}
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                          if (confirm('Delete this project?'))
                            deleteMutation.mutate(project.id)
                        }}
                        className="rounded p-1 text-[var(--text-secondary)] hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
