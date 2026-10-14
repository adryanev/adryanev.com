import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { getCategoryWithProjects } from '@/server/functions/public.functions'
import { seoMeta, canonicalLink, breadcrumbJsonLd, jsonLdScript } from '@/lib/seo'

import '@/components/work/work.css'
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
      <div className="chapter-page chapter-notice text-center p-12 brutal-border brutal-shadow bg-bg-primary dark:bg-bg-secondary">
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
  return <div className="chapter-page mx-auto">
    <Link to="/portfolio" className="writing-entry__link mb-8"><ArrowLeft size={18} /> All work</Link>
    <header className="chapter-header">
      <h1>{category.name}</h1>
      <p>{category.description}<br />{projects.length} project{projects.length === 1 ? '' : 's'}</p>
    </header>
    {projects.length ? <ul className="work-ledger">
      {projects.map((project) => <li key={project.id}>
        <Link className="work-ledger__row" to="/portfolio/$category/$slug" params={{ category: category.slug, slug: project.slug }}>
          <span className="work-ledger__identity"><strong>{project.title}</strong><span className="work-ledger__meta">{project.role} · {project.workplace}</span></span>
          <span className="work-ledger__tail"><time>{project.year}</time><ArrowUpRight size={22} aria-hidden="true" /></span>
          {!!project.technology.length && <span className="work-technologies" aria-label="Technologies">{project.technology.map((technology) => <span key={technology}>{technology}</span>)}</span>}
        </Link>
      </li>)}
    </ul> : <section className="page-empty"><h2>No published projects here yet</h2><p>Browse another category to explore more work.</p><Link to="/portfolio" className="page-button">Browse all work</Link></section>}
  </div>
}
