import { createFileRoute } from '@tanstack/react-router'
import { ProjectForm } from '@/components/admin/ProjectForm'
import { getCategories } from '@/server/functions/portfolio.functions'

export const Route = createFileRoute('/admin/_layout/portfolio/new')({
  loader: () => getCategories(),
  component: NewProjectPage,
})

function NewProjectPage() {
  const categories = Route.useLoaderData()

  return (
    <div>
      <h1 className="text-2xl font-bold">New Project</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Add a new portfolio project
      </p>
      <div className="mt-6">
        <ProjectForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
      </div>
    </div>
  )
}
