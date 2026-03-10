import { createFileRoute, Link } from '@tanstack/react-router'
import { FolderOpen, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPublicCategories } from '@/server/functions/public.functions'

export const Route = createFileRoute('/portfolio/')({
  loader: () => getPublicCategories(),
  component: PortfolioPage,
  head: () => ({
    meta: [
      { title: 'Portfolio — Adryan Eka Vandra' },
      {
        name: 'description',
        content:
          'Portfolio of projects by Adryan Eka Vandra, organized by career phase.',
      },
    ],
  }),
})

function PortfolioPage() {
  const categories = Route.useLoaderData()

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold">Portfolio</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Projects organized by career phase.
      </p>

      {categories.length === 0 ? (
        <div className="mt-12 text-center text-slate-500">
          No projects yet.
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to="/portfolio/$category"
              params={{ category: cat.slug }}
              className={cn(
                'group rounded-lg border p-6 transition-colors',
                'border-slate-200 hover:border-accent/30 hover:bg-accent/5',
                'dark:border-slate-800 dark:hover:border-accent/30 dark:hover:bg-accent/5',
              )}
            >
              <div className="flex items-center gap-3">
                <FolderOpen className="h-5 w-5 text-accent" />
                <h2 className="text-lg font-semibold group-hover:text-accent">
                  {cat.name}
                </h2>
              </div>
              {cat.description && (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {cat.description}
                </p>
              )}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {cat.projectCount} project{cat.projectCount !== 1 ? 's' : ''}
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-accent" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
