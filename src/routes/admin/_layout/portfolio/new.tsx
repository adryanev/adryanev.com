import { createFileRoute } from '@tanstack/react-router'
import { ProjectForm } from '@/components/admin/ProjectForm'
import { getCategories } from '@/server/functions/portfolio.functions'

import { PageHeader } from '@/components/ui'

const parseCategoryId = (value: unknown) => {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : undefined
}

export const Route = createFileRoute('/admin/_layout/portfolio/new')({
  validateSearch: (search: Record<string, unknown>): { categoryId?: number } => ({
    categoryId: parseCategoryId(search.categoryId),
  }),
  loader: () => getCategories(),
  component: NewProjectPage,
})

function NewProjectPage() {
  const categories = Route.useLoaderData()
  const { categoryId } = Route.useSearch()
  const defaultCategoryId = categories.some((c) => c.id === categoryId)
    ? categoryId
    : undefined

  return (
    <div>
      <PageHeader>
        <div>
          <h1 className="text-2xl font-bold">New Project</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Add a new portfolio project
          </p>
        </div>
      </PageHeader>
      <div className="mt-6">
        <ProjectForm
          key={defaultCategoryId}
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          defaultCategoryId={defaultCategoryId}
        />
      </div>
    </div>
  )
}
