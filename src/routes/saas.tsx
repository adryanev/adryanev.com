import { createFileRoute } from '@tanstack/react-router'
import { Github, Zap, Server } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPublicSaas } from '@/server/functions/public.functions'
import { Reveal, StaggerChildren, StaggerItem } from '@/components/motion/Reveal'

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

function SaasPage() {
  const listings = Route.useLoaderData()

  const grouped = {
    active: listings.filter((l) => l.status === 'active'),
    beta: listings.filter((l) => l.status === 'beta'),
    retired: listings.filter((l) => l.status === 'retired'),
  }

  const ordered = [...grouped.active, ...grouped.beta, ...grouped.retired]

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 md:py-24">
      <Reveal>
        <div className="mb-16 border-b-4 border-text-primary pb-8">
          <h1 className="font-serif text-6xl font-medium tracking-tight md:text-8xl lg:text-[10rem] uppercase">
            SaaS
          </h1>
          <div className="mt-8 flex items-center gap-4">
            <div className="h-4 w-4 bg-accent brutal-border" />
            <span className="font-mono text-sm text-text-secondary tracking-wider">
              Products & Infrastructure
            </span>
          </div>
        </div>
      </Reveal>

      {ordered.length === 0 ? (
        <div className="mt-12 text-center text-text-secondary font-serif text-2xl italic">
          No products listed yet.
        </div>
      ) : (
        <StaggerChildren className="grid gap-8 md:grid-cols-2">
          {ordered.map((product) => (
            <StaggerItem key={product.id}>
              <div
                className={cn(
                  'flex flex-col border-2 border-text-primary bg-bg-primary brutal-shadow transition-all hover:-translate-y-1 hover:brutal-shadow-lg',
                  product.status === 'retired' && 'opacity-60'
                )}
              >
                {/* Header */}
                <div className="border-b-2 border-text-primary bg-bg-secondary p-6 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-text-primary text-bg-primary brutal-border overflow-hidden">
                      {product.logoUrl ? (
                        <img src={product.logoUrl} alt={product.name} loading="lazy" className="h-6 w-6 object-cover" />
                      ) : (
                        <Server className="h-6 w-6" />
                      )}
                    </div>
                    <h2 className="font-serif text-3xl font-bold italic">{product.name}</h2>
                  </div>
                  <StatusBadge status={product.status} />
                </div>

                {/* Body */}
                <div className="p-8 flex-1 flex flex-col">
                  <p className="font-sans text-lg text-text-secondary mb-8 flex-1">
                    {product.description}
                  </p>

                  {product.technology && product.technology.length > 0 && (
                    <div className="space-y-3 mb-8">
                      {product.technology.map(tech => (
                        <div key={tech} className="flex items-center gap-3 font-mono text-sm text-text-primary">
                          <Zap className="h-4 w-4 text-accent" />
                          {tech}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col gap-4 mt-auto pt-4">
                    {product.url && (
                      <a href={product.url} target="_blank" rel="noopener noreferrer" className="w-full text-center bg-text-primary text-bg-primary py-4 font-mono font-bold uppercase tracking-widest brutal-border transition-colors hover:bg-accent hover:text-accent-fg">
                        Visit
                      </a>
                    )}
                    {product.githubUrl && (
                      <a href={product.githubUrl} target="_blank" rel="noopener noreferrer" className="w-full text-center flex items-center justify-center gap-2 bg-bg-secondary text-text-primary py-4 font-mono font-bold uppercase tracking-widest brutal-border transition-colors hover:text-accent hover:border-accent">
                        <Github className="h-4 w-4" /> Source Code
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'bg-accent text-accent-fg',
    beta: 'bg-accent/20 text-accent border-accent',
    retired: 'bg-text-secondary/20 text-text-secondary',
  }
  return (
    <span
      className={cn(
        'px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest brutal-border',
        colors[status] ?? colors.active,
      )}
    >
      {status}
    </span>
  )
}
