import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { ArrowLeft, Github, Globe } from 'lucide-react'
import { getPublicProject } from '@/server/functions/public.functions'
import { Reveal, StaggerChildren, StaggerItem } from '@/components/motion/Reveal'
import { seoMeta, canonicalLink, breadcrumbJsonLd, jsonLdScript } from '@/lib/seo'

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
    <div className="flex min-h-[60vh] items-center justify-center border-b border-border">
      <div className="text-center p-12 brutal-border brutal-shadow bg-bg-primary dark:bg-bg-secondary">
        <p className="font-serif text-8xl font-bold text-accent italic">404</p>
        <p className="mt-4 font-serif text-2xl font-bold italic text-text-primary">
          Project Not Found
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
      return { meta: [{ title: 'Project Not Found' }] }
    }
    const path = `/portfolio/${loaderData.category.slug}/${loaderData.slug}`
    const firstImage = loaderData.images[0]?.url
    return {
      meta: seoMeta({
        title: `${loaderData.title} — Portfolio — Adryan Eka Vandra`,
        description: loaderData.description.slice(0, 160),
        path,
        image: firstImage,
      }),
      links: [canonicalLink(path)],
      scripts: [
        jsonLdScript(breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Portfolio', path: '/portfolio' },
          { name: loaderData.category.name, path: `/portfolio/${loaderData.category.slug}` },
          { name: loaderData.title, path },
        ])),
      ],
    }
  },
})

function ProjectDetailPage() {
  const project = Route.useLoaderData()

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 md:py-24">
      <Reveal>
        <Link
          to="/portfolio/$category"
          params={{ category: project.category.slug }}
          className="inline-flex items-center gap-3 bg-text-primary px-6 py-2 font-mono text-sm font-bold uppercase tracking-widest text-bg-primary transition-colors hover:bg-accent hover:text-accent-fg brutal-border border-text-primary mb-12"
        >
          <ArrowLeft className="h-4 w-4" /> Back to {project.category.name}
        </Link>
      </Reveal>

      <Reveal>
        <div className="mb-16 border-b-4 border-text-primary pb-8 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="font-serif text-5xl font-medium tracking-tight md:text-7xl lg:text-[8rem] uppercase leading-none">
              {project.title}
            </h1>
            <div className="mt-8 flex items-center gap-4">
              <div className="h-4 w-4 bg-accent brutal-border" />
              <span className="font-mono text-sm text-text-secondary tracking-wider">
                {project.role} · {project.year}
              </span>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="grid gap-16 lg:grid-cols-[1fr_2.5fr]">
        <div className="space-y-8">
          <Reveal>
            <div className="brutal-border bg-bg-secondary p-6 space-y-4">
              <h3 className="font-serif text-lg font-bold italic text-text-primary border-b-2 border-text-primary pb-2">Details</h3>

              <div className="flex justify-between border-b border-border pb-2">
                <span className="font-mono text-sm text-text-secondary">Year</span>
                <span className="font-mono text-sm text-text-primary">{project.year}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="font-mono text-sm text-text-secondary">Workplace</span>
                <span className="font-mono text-sm text-text-primary text-right">{project.workplace}</span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="brutal-border bg-bg-primary p-6 space-y-4">
              <h3 className="font-serif text-lg font-bold italic text-text-primary border-b-2 border-text-primary pb-2">Tech Stack</h3>
              <div className="flex flex-wrap gap-2 pt-2">
                {project.technology.map((t) => (
                  <span key={t} className="px-2 py-1 bg-bg-secondary text-text-secondary border border-border text-xs font-mono">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          {(project.externalUrl || project.githubUrl) && (
            <Reveal delay={0.15}>
              <div className="space-y-4">
                {project.externalUrl && (
                  <a href={project.externalUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between w-full bg-text-primary text-bg-primary px-6 py-4 font-mono font-bold uppercase tracking-widest brutal-border transition-colors hover:bg-accent hover:text-accent-fg">
                    <span>Visit Site</span>
                    <Globe className="h-5 w-5" />
                  </a>
                )}
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between w-full bg-bg-secondary text-text-primary px-6 py-4 font-mono font-bold uppercase tracking-widest brutal-border transition-colors hover:text-accent hover:border-accent">
                    <span>Source Code</span>
                    <Github className="h-5 w-5" />
                  </a>
                )}
              </div>
            </Reveal>
          )}
        </div>

        <div className="space-y-16 min-w-0">
          <Reveal>
            <div
              className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-serif prose-headings:italic prose-headings:font-bold prose-a:text-accent prose-p:font-sans"
              dangerouslySetInnerHTML={{ __html: project.descriptionHtml }}
            />
          </Reveal>

          {project.images.length > 0 && (
            <Reveal>
              <div className="space-y-8 pt-8 border-t-2 border-border">
                <h3 className="font-serif text-2xl font-bold italic text-text-primary mb-8">Gallery</h3>
                <StaggerChildren className="grid gap-8">
                  {project.images.map((img: { id: number; url: string; alt: string | null }) => (
                    <StaggerItem key={img.id}>
                      <figure className="relative group brutal-border bg-bg-secondary">
                        <img
                          src={img.url}
                          alt={img.alt ?? project.title}
                          className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                          loading="lazy"
                        />
                        {img.alt && (
                          <figcaption className="absolute bottom-4 left-4 right-4 bg-bg-primary p-4 brutal-border font-mono text-xs text-text-primary tracking-wider">
                            {img.alt}
                          </figcaption>
                        )}
                      </figure>
                    </StaggerItem>
                  ))}
                </StaggerChildren>
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </div>
  )
}
