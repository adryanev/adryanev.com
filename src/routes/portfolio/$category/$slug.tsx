import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { ArrowLeft, Github, ExternalLink, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPublicProject } from '@/server/functions/public.functions'

export const Route = createFileRoute('/portfolio/$category/$slug')({
  loader: async ({ params }) => {
    const project = await getPublicProject({
      data: {
        categorySlug: params.category,
        projectSlug: params.slug,
      },
    })
    if (!project) throw notFound()
    return project
  },
  component: ProjectDetailPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
      <p className="font-mono text-6xl font-bold text-accent">404</p>
      <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
        Project not found
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
          ? `${loaderData.title} — Portfolio — Adryan Eka Vandra`
          : 'Project Not Found',
      },
      {
        name: 'description',
        content: loaderData?.description.slice(0, 160) ?? '',
      },
    ],
  }),
})

function ProjectDetailPage() {
  const project = Route.useLoaderData()

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <Link
        to="/portfolio/$category"
        params={{ category: project.category.slug }}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-accent"
      >
        <ArrowLeft className="h-3 w-3" /> {project.category.name}
      </Link>

      <div className="mt-8 flex flex-col gap-10 lg:flex-row">
        {/* Left sidebar — project metadata */}
        <div className="lg:w-72 lg:shrink-0">
          <h1 className="text-3xl font-bold">{project.title}</h1>

          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="font-mono text-xs uppercase text-slate-500">Year</dt>
              <dd className="mt-0.5 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-accent" />
                {project.year}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-xs uppercase text-slate-500">Role</dt>
              <dd className="mt-0.5">{project.role}</dd>
            </div>
            <div>
              <dt className="font-mono text-xs uppercase text-slate-500">
                Workplace
              </dt>
              <dd className="mt-0.5">{project.workplace}</dd>
            </div>
          </dl>

          {/* Technology tags */}
          <div className="mt-6">
            <p className="font-mono text-xs uppercase text-slate-500">
              Technology
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {project.technology.map((tech) => (
                <span
                  key={tech}
                  className="rounded-md bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="mt-6 flex flex-col gap-2">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                  'border-slate-200 hover:border-accent hover:text-accent',
                  'dark:border-slate-800 dark:hover:border-accent',
                )}
              >
                <Github className="h-4 w-4" /> View Source
              </a>
            )}
            {project.externalUrl && (
              <a
                href={project.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-accent-hover"
              >
                <ExternalLink className="h-4 w-4" /> Visit Project
              </a>
            )}
          </div>
        </div>

        {/* Right area — description + screenshots */}
        <div className="flex-1">
          {/* Description */}
          <div
            className={cn(
              'prose prose-slate dark:prose-invert max-w-none',
              'prose-headings:font-bold prose-a:text-accent',
            )}
            dangerouslySetInnerHTML={{ __html: project.descriptionHtml }}
          />

          {/* Screenshot gallery */}
          {project.images.length > 0 && (
            <div className="mt-10">
              <h2 className="text-lg font-semibold">Screenshots</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {project.images.map((img) => (
                  <figure key={img.id}>
                    <img
                      src={img.url}
                      alt={img.alt ?? project.title}
                      className="rounded-lg border border-slate-200 dark:border-slate-800"
                      loading="lazy"
                    />
                    {img.alt && (
                      <figcaption className="mt-1 text-xs text-slate-500">
                        {img.alt}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
