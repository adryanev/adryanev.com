import { createFileRoute } from '@tanstack/react-router'
import { ProjectForm } from '@/components/admin/ProjectForm'
import { getProjectById, getCategories } from '@/server/functions/portfolio.functions'

export const Route = createFileRoute('/admin/_layout/portfolio/$id/edit')({
  loader: async ({ params }) => {
    const [project, categories] = await Promise.all([
      getProjectById({ data: { id: Number(params.id) } }),
      getCategories(),
    ])
    return { project, categories }
  },
  component: EditProjectPage,
})

function EditProjectPage() {
  const { project, categories } = Route.useLoaderData()

  if (!project) {
    return <div className="py-12 text-center text-slate-500">Project not found</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Edit Project</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Editing: {project.title}
      </p>
      <div className="mt-6">
        <ProjectForm
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          initial={{
            id: project.id,
            title: project.title,
            slug: project.slug,
            categoryId: project.categoryId,
            description: project.description,
            year: project.year,
            role: project.role,
            workplace: project.workplace,
            technology: project.technology,
            githubUrl: project.githubUrl ?? '',
            externalUrl: project.externalUrl ?? '',
            status: project.status,
            sortOrder: project.sortOrder,
            images: project.images.map((img) => ({
              url: img.url,
              alt: img.alt ?? undefined,
            })),
          }}
        />
      </div>
    </div>
  )
}
