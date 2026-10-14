import { createFileRoute } from '@tanstack/react-router'
import { Github } from 'lucide-react'
import { getPublicSaas } from '@/server/functions/public.functions'
import { seoMeta, canonicalLink } from '@/lib/seo'

import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
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
  const ordered = ['active', 'beta', 'retired'].flatMap((status) => listings.filter((product) => product.status === status))
  return <div className="chapter-page chapter-products mx-auto">
    <header className="chapter-header"><h1>Products</h1><p>Software and services I build and maintain.</p></header>
    {ordered.length === 0 ? <section className="page-empty">
      <h2>No products listed yet</h2><p>For examples of my engineering work, explore the project archive.</p>
      <Link to="/portfolio" className="page-button">Explore projects <ArrowUpRight size={18} /></Link>
    </section> : ordered.map((product) => <article key={product.id} className="product-record">
      <div>
        <div className="product-record__identity">
          {product.logoUrl && <img src={product.logoUrl} alt="" width={48} height={48} loading="lazy" className="product-record__logo"
            onError={(event) => { event.currentTarget.hidden = true }} />}
          <h2>{product.name}</h2>
        </div>
        <p>{product.description}</p>
        <div className="page-actions">
          {product.url && <a className="page-button" href={product.url} target="_blank" rel="noopener noreferrer">Open product <ArrowUpRight size={18} /></a>}
          {product.githubUrl && <a className="page-button page-button--quiet" href={product.githubUrl} target="_blank" rel="noopener noreferrer"><Github size={18} /> GitHub</a>}
        </div>
      </div>
      <dl className="product-record__facts">
        <dt>Status</dt><dd><span className="product-state" data-status={product.status}>{product.status === 'active' ? 'Active' : product.status === 'beta' ? 'Beta' : 'Retired'}</span></dd>
        <dt>Technologies</dt><dd>{product.technology?.length ? <div className="adventure-tags">{product.technology.map((tech) => <span key={tech}>{tech}</span>)}</div> : 'Not listed'}</dd>
      </dl>
    </article>)}
  </div>
}
