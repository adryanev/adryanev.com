import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { ArrowLeft, Github, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCategoryWithProjects } from '@/server/functions/public.functions'

export const Route = createFileRoute('/portfolio/$category/')({
  loader: async ({ params }) => {
    const data = await getCategoryWithProjects({
      data: { categorySlug: params.category },
    })
    if (!data) throw notFound()
    return data
  },
  component: CategoryPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
      <p className="font-mono text-6xl font-bold text-accent">404</p>
      <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
        Category not found
      </p>
      <Link to="/portfolio" className="mt-6 inline-block text-accent hover:underline">
        Back to portfolio
      </Link>
    </div>
  ),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.category.name} — Portfolio — Adryan Eka Vandra`
          : 'Category Not Found',
      },
    ],
  }),
})

function CategoryPage() {
  const { category, projects } = Route.useLoaderData()

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <Link
        to="/portfolio"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-accent"
      >
        <ArrowLeft className="h-3 w-3" /> Portfolio
      </Link>

      <h1 className="mt-4 text-4xl font-bold">{category.name}</h1>
      {category.description && (
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {category.description}
        </p>
      )}

      {projects.length === 0 ? (
        <div className="mt-12 text-center text-slate-500">
          No published projects in this category yet.
        </div>
      ) : (
        <div className="mt-10 space-y-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              to="/portfolio/$category/$slug"
              params={{ category: category.slug, slug: project.slug }}
              className={cn(
                'group block rounded-lg border p-6 transition-colors',
                'border-slate-200 hover:border-accent/30 hover:bg-accent/5',
                'dark:border-slate-800 dark:hover:border-accent/30 dark:hover:bg-accent/5',
              )}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                {/* Thumbnail */}
                {project.images[0] && (
                  <img
                    src={project.images[0].url}
                    alt={project.images[0].alt ?? project.title}
                    className="h-32 w-full rounded-md object-cover sm:w-48"
                    loading="lazy"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-lg font-semibold group-hover:text-accent">
                    {project.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {project.role} at {project.workplace} · {project.year}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {project.technology.map((tech) => (
                      <span
                        key={tech}
                        className="rounded bg-accent/10 px-1.5 py-0.5 text-xs text-accent"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-3">
                    {project.githubUrl && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Github className="h-3 w-3" /> GitHub
                      </span>
                    )}
                    {project.externalUrl && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <ExternalLink className="h-3 w-3" /> Live
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
