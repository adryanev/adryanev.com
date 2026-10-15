import { createFileRoute } from '@tanstack/react-router'
import { Github } from 'lucide-react'
import { getPublicSaas } from '@/server/functions/public.functions'
import { seoMeta, canonicalLink } from '@/lib/seo'

import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import { PageHeader, EmptyState, Button, Badge } from '@/components/ui'

export const Route = createFileRoute('/saas')({
  loader: () => getPublicSaas(),
  component: SaasPage,
  head: () => ({
    meta: seoMeta({
      title: 'SaaS Products — Adryan Eka Vandra',
      description: 'Active SaaS products built by Adryan Eka Vandra.',
      path: '/saas',
    }),
    links: [canonicalLink('/saas')],
  }),
})

function SaasPage() {
  const listings = Route.useLoaderData()
  const ordered = ['active', 'beta', 'retired'].flatMap((status) =>
    listings.filter((product) => product.status === status),
  )
  return (
    <div className="chapter-page chapter-products mx-auto">
      <PageHeader variant="chapter">
        <h1>Products</h1>
        <p>Software and services I build and maintain.</p>
      </PageHeader>
      {ordered.length === 0 ? (
        <EmptyState>
          <h2>No products listed yet</h2>
          <p>
            For examples of my engineering work, explore the project archive.
          </p>
          <Button asChild variant="primary" size="lg">
            <Link to="/portfolio">
              Explore projects <ArrowUpRight size={18} />
            </Link>
          </Button>
        </EmptyState>
      ) : (
        ordered.map((product) => (
          <article key={product.id} className="product-record">
            <div>
              <div className="product-record__identity">
                {product.logoUrl && (
                  <img
                    src={product.logoUrl}
                    alt=""
                    width={48}
                    height={48}
                    loading="lazy"
                    className="product-record__logo"
                    onError={(event) => {
                      event.currentTarget.hidden = true
                    }}
                  />
                )}
                <h2>{product.name}</h2>
              </div>
              <p>{product.description}</p>
              <div className="page-actions">
                {product.url && (
                  <Button asChild variant="primary" size="lg">
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open product <ArrowUpRight size={18} />
                    </a>
                  </Button>
                )}
                {product.githubUrl && (
                  <Button asChild variant="secondary" size="lg">
                    <a
                      href={product.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github size={18} /> GitHub
                    </a>
                  </Button>
                )}
              </div>
            </div>
            <dl className="product-record__facts">
              <dt>Status</dt>
              <dd>
                <Badge
                  tone={
                    product.status === 'active'
                      ? 'success'
                      : product.status === 'beta'
                        ? 'info'
                        : 'neutral'
                  }
                  data-status={product.status}
                >
                  {product.status === 'active'
                    ? 'Active'
                    : product.status === 'beta'
                      ? 'Beta'
                      : 'Retired'}
                </Badge>
              </dd>
              <dt>Technologies</dt>
              <dd>
                {product.technology?.length ? (
                  <div className="adventure-tags">
                    {product.technology.map((tech) => (
                      <span key={tech}>{tech}</span>
                    ))}
                  </div>
                ) : (
                  'Not listed'
                )}
              </dd>
            </dl>
          </article>
        ))
      )}
    </div>
  )
}
