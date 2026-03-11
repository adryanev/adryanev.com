import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { ArrowLeft, Github, Globe } from 'lucide-react'
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
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Link
        to="/portfolio"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-accent transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All Categories
      </Link>

      <h1 className="mt-6 text-4xl font-bold tracking-tight">{category.name}</h1>
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
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              to="/portfolio/$category/$slug"
              params={{ category: category.slug, slug: project.slug }}
              className={cn(
                'group block overflow-hidden rounded-lg border transition-all',
                'border-slate-200 hover:border-accent/40 hover:shadow-lg',
                'dark:border-slate-800 dark:hover:border-accent/40',
              )}
            >
              {/* Thumbnail */}
              {project.images[0] ? (
                <div className="aspect-video overflow-hidden bg-slate-100 dark:bg-slate-900">
                  <img
                    src={project.images[0].url}
                    alt={project.images[0].alt ?? project.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center bg-slate-100 dark:bg-slate-900">
                  <span className="text-2xl font-bold text-slate-300 dark:text-slate-700">
                    {project.title.charAt(0)}
                  </span>
                </div>
              )}

              {/* Card content */}
              <div className="p-4">
                <h2 className="text-base font-bold group-hover:text-accent transition-colors">
                  {project.title}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {project.role} · {project.workplace} · {project.year}
                </p>

                {/* Technology tags */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {project.technology.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-accent"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technology.length > 4 && (
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 dark:bg-slate-800">
                      +{project.technology.length - 4}
                    </span>
                  )}
                </div>

                {/* Links indicator */}
                <div className="mt-3 flex gap-2">
                  {project.githubUrl && (
                    <Github className="h-3.5 w-3.5 text-slate-400" />
                  )}
                  {project.externalUrl && (
                    <Globe className="h-3.5 w-3.5 text-slate-400" />
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
