import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { ArrowLeft, ArrowUpRight, Github, Globe } from 'lucide-react'
import { getCategoryWithProjects } from '@/server/functions/public.functions'
import { Reveal, StaggerChildren, StaggerItem } from '@/components/motion/Reveal'
import { seoMeta, canonicalLink, breadcrumbJsonLd, jsonLdScript } from '@/lib/seo'

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
    <div className="flex min-h-[60vh] items-center justify-center border-b border-border">
      <div className="text-center p-12 brutal-border brutal-shadow bg-bg-primary dark:bg-bg-secondary">
        <p className="font-serif text-8xl font-bold text-accent italic">404</p>
        <p className="mt-4 font-serif text-2xl font-bold italic text-text-primary">
          Category Not Found
        </p>
        <Link
          to="/portfolio"
          className="mt-8 inline-block brutal-border bg-accent px-8 py-3 text-sm font-bold uppercase tracking-wider text-accent-fg transition-colors hover:bg-text-primary hover:text-bg-primary"
        >
          Back to Portfolio
        </Link>
      </div>
    </div>
  ),
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: 'Category Not Found' }] }
    }
    const path = `/portfolio/${loaderData.category.slug}`
    return {
      meta: seoMeta({
        title: `${loaderData.category.name} — Portfolio — Adryan Eka Vandra`,
        description: loaderData.category.description || `${loaderData.category.name} projects by Adryan Eka Vandra.`,
        path,
      }),
      links: [canonicalLink(path)],
      scripts: [
        jsonLdScript(breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Portfolio', path: '/portfolio' },
          { name: loaderData.category.name, path },
        ])),
      ],
    }
  },
})

function CategoryPage() {
  const { category, projects } = Route.useLoaderData()

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 md:py-24">
      <Reveal>
        <Link
          to="/portfolio"
          className="inline-flex items-center gap-3 bg-text-primary px-6 py-2 font-mono text-sm font-bold uppercase tracking-widest text-bg-primary transition-colors hover:bg-accent hover:text-accent-fg brutal-border border-text-primary mb-12"
        >
          <ArrowLeft className="h-4 w-4" /> All Categories
        </Link>
      </Reveal>

      <Reveal>
        <div className="mb-16 border-b-4 border-text-primary pb-8 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="font-serif text-6xl font-medium tracking-tight md:text-8xl lg:text-[10rem] uppercase">
              {category.name}
            </h1>
            <div className="mt-8 flex items-center gap-4">
              <div className="h-4 w-4 bg-accent brutal-border" />
              <span className="font-mono text-sm text-text-secondary tracking-wider">
                {projects.length} project{projects.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          {category.description && (
            <p className="font-sans text-base max-w-sm text-text-secondary">
              {category.description}
            </p>
          )}
        </div>
      </Reveal>

      {projects.length === 0 ? (
        <div className="mt-12 text-center text-text-secondary font-serif text-2xl italic">
          No published projects in this category yet.
        </div>
      ) : (
        <StaggerChildren className="grid gap-8">
          {projects.map((project, index) => (
            <StaggerItem key={project.id}>
              <div
                className="group relative grid gap-8 border-b-2 border-border pb-8 md:grid-cols-[1fr_3fr_1fr] md:items-center transition-colors hover:border-text-primary"
              >
                {/* Number */}
                <div className="font-mono text-4xl font-bold text-text-secondary group-hover:text-accent transition-colors">
                  {(index + 1).toString().padStart(2, '0')}
                </div>

                {/* Info */}
                <div className="space-y-4">
                  <Link
                    to="/portfolio/$category/$slug"
                    params={{ category: category.slug, slug: project.slug }}
                    className="block"
                  >
                    <h2 className="font-serif text-4xl md:text-6xl font-bold uppercase italic group-hover:underline decoration-4 underline-offset-8 decoration-accent text-text-primary">
                      {project.title}
                    </h2>
                  </Link>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-sm text-text-secondary">
                    <span>{project.role}</span>
                    <span>·</span>
                    <span>{project.workplace}</span>
                    <span>·</span>
                    <span>{project.year}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {project.technology.map((t) => (
                      <span key={t} className="px-2 py-1 bg-bg-secondary text-text-secondary border border-border text-xs font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-4 pt-2">
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors"><Github className="h-5 w-5" /></a>
                    )}
                    {project.externalUrl && (
                      <a href={project.externalUrl} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors"><Globe className="h-5 w-5" /></a>
                    )}
                  </div>
                </div>

                {/* Action */}
                <div className="flex md:justify-end">
                  <Link
                    to="/portfolio/$category/$slug"
                    params={{ category: category.slug, slug: project.slug }}
                    className="flex h-16 w-16 items-center justify-center bg-bg-primary text-text-primary brutal-border transition-all group-hover:bg-accent group-hover:text-accent-fg group-hover:-translate-y-1 group-hover:brutal-shadow"
                  >
                    <ArrowUpRight className="h-8 w-8 transition-transform group-hover:rotate-12" />
                  </Link>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      )}
    </div>
  )
}
