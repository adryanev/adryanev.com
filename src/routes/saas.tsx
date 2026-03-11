import { createFileRoute } from '@tanstack/react-router'
import { ExternalLink, Github } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPublicSaas } from '@/server/functions/public.functions'

export const Route = createFileRoute('/saas')({
  loader: () => getPublicSaas(),
  component: SaasPage,
  head: () => ({
    meta: [
      { title: 'SaaS Products — Adryan Eka Vandra' },
      {
        name: 'description',
        content: 'Active SaaS products built by Adryan Eka Vandra.',
      },
    ],
  }),
})

const statusColors = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  beta: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  retired: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500',
}

function SaasPage() {
  const listings = Route.useLoaderData()

  // Group: active first, then beta, then retired
  const grouped = {
    active: listings.filter((l) => l.status === 'active'),
    beta: listings.filter((l) => l.status === 'beta'),
    retired: listings.filter((l) => l.status === 'retired'),
  }

  const ordered = [...grouped.active, ...grouped.beta, ...grouped.retired]

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold">SaaS Products</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Products I've built and maintain.
      </p>

      {ordered.length === 0 ? (
        <div className="mt-12 text-center text-slate-500">
          No products listed yet.
        </div>
      ) : (
        <div className="mt-10 space-y-6">
          {ordered.map((saas) => (
            <div
              key={saas.id}
              className={cn(
                'rounded-lg border p-6 transition-colors',
                'border-slate-200 dark:border-slate-800',
                saas.status === 'retired' && 'opacity-60',
              )}
            >
              <div className="flex items-start gap-4">
                {saas.logoUrl && (
                  <img
                    src={saas.logoUrl}
                    alt={saas.name}
                    className="h-12 w-12 rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">{saas.name}</h2>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        statusColors[saas.status],
                      )}
                    >
                      {saas.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {saas.description}
                  </p>

                  {/* Tech tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {saas.technology.map((tech) => (
                      <span
                        key={tech}
                        className="rounded bg-accent/10 px-1.5 py-0.5 text-xs text-accent"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Links */}
                  <div className="mt-4 flex gap-3">
                    {saas.url && (
                      <a
                        href={saas.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Visit
                      </a>
                    )}
                    {saas.githubUrl && (
                      <a
                        href={saas.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-accent"
                      >
                        <Github className="h-3.5 w-3.5" /> Source
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
