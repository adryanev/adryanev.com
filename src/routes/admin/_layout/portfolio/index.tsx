import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getProjects, deleteProject } from '@/server/functions/portfolio.functions'

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your portfolio projects
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/portfolio/categories"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Categories
          </Link>
          <Link
            to="/admin/portfolio/new"
            className={cn(
              'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium',
              'bg-accent text-slate-950 hover:bg-accent-hover',
            )}
          >
            <Plus className="h-4 w-4" />
            New Project
          </Link>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="mt-12 text-center text-slate-500 dark:text-slate-400">
          <p>No projects yet.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Category</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Year</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="border-b border-slate-100 dark:border-slate-800/50"
                >
                  <td className="px-4 py-3 font-medium">{project.title}</td>
                  <td className="hidden px-4 py-3 text-slate-500 sm:table-cell">
                    {project.category?.name}
                  </td>
                  <td className="hidden px-4 py-3 text-slate-500 md:table-cell">
                    {project.year}
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
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
                        to="/admin/portfolio/$id/edit"
                        params={{ id: String(project.id) }}
                        className="rounded p-1 text-slate-500 hover:text-accent"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => {
                          if (confirm('Delete this project?'))
                            deleteMutation.mutate(project.id)
                        }}
                        className="rounded p-1 text-slate-500 hover:text-red-500"
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
