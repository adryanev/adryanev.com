import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Code2, Newspaper, Rocket } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getHomePageData } from '@/server/functions/public.functions'

export const Route = createFileRoute('/')({
  loader: () => getHomePageData(),
  component: HomePage,
  head: () => ({
    meta: [
      { title: 'Adryan Eka Vandra — Software Engineer' },
      {
        name: 'description',
        content:
          'Personal website of Adryan Eka Vandra — Software Engineer. Portfolio, blog, resume, and active SaaS projects.',
      },
    ],
  }),
})

function HomePage() {
  const { latestPosts, featuredProjects, activeSaas } = Route.useLoaderData()

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Hero */}
      <section className="py-20 text-center sm:py-28">
        <p className="font-mono text-sm text-accent">Hello, world! I'm</p>
        <h1 className="mt-4 text-5xl font-bold tracking-tight sm:text-6xl">
          Adryan Eka Vandra
        </h1>
        <p className="mt-4 max-w-xl mx-auto text-lg text-slate-600 dark:text-slate-400">
          Software Engineer building things for the web. I write code, ship
          products, and share what I learn along the way.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-slate-950 transition-colors hover:bg-accent-hover"
          >
            View my work <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Get in touch
          </Link>
        </div>
      </section>

      {/* Latest Blog Posts */}
      {latestPosts.length > 0 && (
        <section className="border-t border-slate-200 py-16 dark:border-slate-800">
          <SectionHeader
            icon={Newspaper}
            title="Latest Posts"
            linkTo="/blog"
            linkLabel="All posts"
          />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latestPosts.map((post) => (
              <Link
                key={post.id}
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className={cn(
                  'group rounded-lg border p-5 transition-colors',
                  'border-slate-200 hover:border-accent/30 hover:bg-accent/5',
                  'dark:border-slate-800 dark:hover:border-accent/30 dark:hover:bg-accent/5',
                )}
              >
                <p className="text-xs text-slate-500">
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : ''}
                </p>
                <h3 className="mt-2 font-semibold group-hover:text-accent">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-1">
                  {post.postsToTags.map((pt) => (
                    <span
                      key={pt.tag.id}
                      className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    >
                      {pt.tag.name}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="border-t border-slate-200 py-16 dark:border-slate-800">
          <SectionHeader
            icon={Code2}
            title="Featured Projects"
            linkTo="/portfolio"
            linkLabel="All projects"
          />
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {featuredProjects.map((project) => (
              <Link
                key={project.id}
                to="/portfolio/$category"
                params={{ category: project.category.slug }}
                className={cn(
                  'group rounded-lg border p-5 transition-colors',
                  'border-slate-200 hover:border-accent/30 hover:bg-accent/5',
                  'dark:border-slate-800 dark:hover:border-accent/30 dark:hover:bg-accent/5',
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold group-hover:text-accent">
                      {project.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {project.role} at {project.workplace} · {project.year}
                    </p>
                  </div>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {project.category.name}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {project.technology.slice(0, 5).map((tech) => (
                    <span
                      key={tech}
                      className="rounded bg-accent/10 px-1.5 py-0.5 text-xs text-accent"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Active SaaS */}
      {activeSaas.length > 0 && (
        <section className="border-t border-slate-200 py-16 dark:border-slate-800">
          <SectionHeader
            icon={Rocket}
            title="SaaS Products"
            linkTo="/saas"
            linkLabel="View all"
          />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activeSaas.map((saas) => (
              <div
                key={saas.id}
                className={cn(
                  'rounded-lg border p-5',
                  'border-slate-200 dark:border-slate-800',
                )}
              >
                <div className="flex items-center gap-3">
                  {saas.logoUrl && (
                    <img
                      src={saas.logoUrl}
                      alt={saas.name}
                      className="h-8 w-8 rounded"
                    />
                  )}
                  <h3 className="font-semibold">{saas.name}</h3>
                  <StatusBadge status={saas.status} />
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                  {saas.description}
                </p>
                {saas.url && (
                  <a
                    href={saas.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-sm text-accent hover:underline"
                  >
                    Visit <ArrowRight className="h-3 w-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function SectionHeader({
  icon: Icon,
  title,
  linkTo,
  linkLabel,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  linkTo: string
  linkLabel: string
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-accent" />
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <Link
        to={linkTo}
        className="flex items-center gap-1 text-sm text-accent hover:underline"
      >
        {linkLabel} <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    beta: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    retired: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500',
  }
  return (
    <span
      className={cn(
        'ml-auto rounded-full px-2 py-0.5 text-xs font-medium',
        colors[status as keyof typeof colors] ?? colors.active,
      )}
    >
      {status}
    </span>
  )
}
