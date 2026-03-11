import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { ArrowLeft, Github, Globe, Mail, Linkedin } from 'lucide-react'
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
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* Back link */}
      <Link
        to="/portfolio/$category"
        params={{ category: project.category.slug }}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-accent transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to {project.category.name}
      </Link>

      {/* Main two-column layout */}
      <div className="mt-8 flex flex-col gap-10 lg:flex-row">
        {/* Left sidebar — project metadata */}
        <div className="lg:w-64 lg:shrink-0">
          <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>

          <dl className="mt-8 space-y-5">
            <div>
              <dt className="text-sm font-bold">Year Accomplished</dt>
              <dd className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                {project.year}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-bold">Role</dt>
              <dd className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                {project.role}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-bold">Workplace</dt>
              <dd className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                {project.workplace}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-bold">Technology Used</dt>
              <dd className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                {project.technology.join(', ')}
              </dd>
            </div>
          </dl>

          {/* Publication Links */}
          {(project.githubUrl || project.externalUrl) && (
            <div className="mt-5">
              <p className="text-sm font-bold">Publication Link</p>
              <div className="mt-1.5 flex flex-col gap-1.5">
                {project.externalUrl && (
                  <a
                    href={project.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-accent hover:underline break-all"
                  >
                    <Globe className="h-3.5 w-3.5 shrink-0" />
                    {project.externalUrl.replace(/^https?:\/\//, '')}
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-accent hover:underline break-all"
                  >
                    <Github className="h-3.5 w-3.5 shrink-0" />
                    {project.githubUrl.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right area — description + screenshots */}
        <div className="flex-1 min-w-0">
          {/* Description */}
          <h2 className="text-lg font-bold">Project Description</h2>
          <div
            className={cn(
              'mt-2 prose prose-slate dark:prose-invert max-w-none prose-sm',
              'prose-headings:font-bold prose-a:text-accent',
            )}
            dangerouslySetInnerHTML={{ __html: project.descriptionHtml }}
          />

          {/* Screenshot gallery */}
          {project.images.length > 0 && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {project.images.map((img) => (
                <figure key={img.id} className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
                  <img
                    src={img.url}
                    alt={img.alt ?? project.title}
                    className="w-full object-cover"
                    loading="lazy"
                  />
                  {img.alt && (
                    <figcaption className="px-3 py-1.5 text-xs text-slate-500 bg-slate-50 dark:bg-slate-900">
                      {img.alt}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 flex flex-col gap-4 border-t border-slate-200 pt-6 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">Adryan Eka Vandra</p>
          <p className="text-xs text-slate-500">Software Engineer</p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
          <a href="mailto:adryanekavandra@gmail.com" className="flex items-center gap-1 hover:text-accent transition-colors">
            <Mail className="h-3 w-3" /> adryanekavandra@gmail.com
          </a>
          <a href="https://linkedin.com/in/adryanev" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-accent transition-colors">
            <Linkedin className="h-3 w-3" /> linkedin.com/in/adryanev
          </a>
          <a href="https://github.com/adryanev" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-accent transition-colors">
            <Github className="h-3 w-3" /> github.com/adryanev
          </a>
        </div>
        <Link
          to="/portfolio"
          className="text-xs font-medium text-accent hover:underline"
        >
          Portfolio
        </Link>
      </footer>
    </div>
  )
}
