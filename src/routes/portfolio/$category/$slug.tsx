import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { getPublicProject } from '@/server/functions/public.functions'
import { ProjectDossier } from '@/components/work/ProjectDossier'
import { seoMeta, canonicalLink, breadcrumbJsonLd, jsonLdScript } from '@/lib/seo'

export const Route = createFileRoute('/portfolio/$category/$slug')({
  loader: async ({ params }) => {
    const project = await getPublicProject({
      data: { categorySlug: params.category, projectSlug: params.slug },
    })
    if (!project) throw notFound()
    return project
  },
  component: ProjectDetailPage,
  pendingComponent: () => (
    <section className="project-dossier-status" role="status">
      <h1>Loading project</h1>
      <p>Loading the project notes and details.</p>
    </section>
  ),
  errorComponent: () => (
    <section className="project-dossier-status" role="alert">
      <h1>Project could not load</h1>
      <p>The project notes and details could not be loaded. Try again, or return to all projects.</p>
      <div className="project-dossier-status__actions">
        <button type="button" onClick={() => window.location.reload()}>Try again</button>
        <Link to="/portfolio">All projects</Link>
      </div>
    </section>
  ),
  notFoundComponent: () => (
    <section className="project-dossier-status">
      <h1>Project not found</h1>
      <p>This project is unavailable. Explore the archive for other work.</p>
      <div className="project-dossier-status__actions"><Link to="/portfolio">All projects</Link></div>
    </section>
  ),
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: 'Project not found' }] }
    const path = `/portfolio/${loaderData.category.slug}/${loaderData.slug}`
    return {
      meta: seoMeta({
        title: `${loaderData.title} — Portfolio — Adryan Eka Vandra`,
        description: loaderData.description.slice(0, 160),
        path,
        image: loaderData.images[0]?.url,
      }),
      links: [canonicalLink(path)],
      scripts: [jsonLdScript(breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Portfolio', path: '/portfolio' },
        { name: loaderData.category.name, path: `/portfolio/${loaderData.category.slug}` },
        { name: loaderData.title, path },
      ]))],
    }
  },
})

function ProjectDetailPage() {
  const project = Route.useLoaderData()
  return <ProjectDossier project={project} />
}
