import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import { getPublicCategories } from '@/server/functions/public.functions'
import { Reveal, StaggerChildren, StaggerItem } from '@/components/motion/Reveal'
import { seoMeta, canonicalLink } from '@/lib/seo'

export const Route = createFileRoute('/portfolio/')({
  loader: () => getPublicCategories(),
  component: PortfolioPage,
  head: () => ({
    meta: seoMeta({
      title: 'Portfolio — Adryan Eka Vandra',
      description: 'Portfolio of projects by Adryan Eka Vandra, organized by career phase.',
      path: '/portfolio',
    }),
    links: [canonicalLink('/portfolio')],
  }),
})

function PortfolioPage() {
  const categories = Route.useLoaderData()

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 md:py-24">
      <Reveal>
        <div className="mb-16 border-b-4 border-text-primary pb-8 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="font-serif text-6xl font-medium tracking-tight md:text-8xl lg:text-[10rem] uppercase">
              Work
            </h1>
            <div className="mt-8 flex items-center gap-4">
              <div className="h-4 w-4 bg-accent brutal-border" />
              <span className="font-mono text-sm text-text-secondary tracking-wider">
                Project Categories
              </span>
            </div>
          </div>
          <p className="font-sans text-base max-w-sm text-text-secondary">
            A collection of systems and interfaces built for performance and impact across different organizations.
          </p>
        </div>
      </Reveal>

      {categories.length === 0 ? (
        <div className="mt-12 text-center text-text-secondary font-serif text-2xl italic">
          No projects yet.
        </div>
      ) : (
        <StaggerChildren className="grid gap-8">
          {categories.map((cat: { id: number; name: string; slug: string; description: string | null; projectCount: number }, index: number) => (
            <StaggerItem key={cat.id}>
              <div
                className="group relative grid gap-8 border-b-2 border-border pb-8 md:grid-cols-[1fr_3fr_1fr] md:items-center transition-colors hover:border-text-primary"
              >
                {/* Number */}
                <div className="font-mono text-4xl font-bold text-text-secondary group-hover:text-accent transition-colors">
                  {(index + 1).toString().padStart(2, '0')}
                </div>

                {/* Info */}
                <div className="space-y-4">
                  <h2 className="font-serif text-4xl md:text-6xl font-bold uppercase italic group-hover:underline decoration-4 underline-offset-8 decoration-accent transition-all">
                    <Link to="/portfolio/$category" params={{ category: cat.slug }}>
                      {cat.name}
                    </Link>
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-sm text-text-secondary">
                    <span>
                      {cat.projectCount} project{cat.projectCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-lg text-text-primary max-w-2xl font-serif">
                    {cat.description || 'Explore projects in this category.'}
                  </p>
                </div>

                {/* Action */}
                <div className="flex md:justify-end">
                  <Link
                    to="/portfolio/$category"
                    params={{ category: cat.slug }}
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
