import { createFileRoute } from '@tanstack/react-router'
import { getPublicWork } from '@/server/functions/public.functions'
import { seoMeta, canonicalLink } from '@/lib/seo'
import { WorkIndex } from '@/components/work/WorkIndex'
import '@/components/work/work.css'

export const Route = createFileRoute('/portfolio/')({
  loader: () => getPublicWork(),
  component: PortfolioPage,
  head: () => ({
    meta: seoMeta({
      title: 'Portfolio — Adryan Eka Vandra',
      description: 'Portfolio of projects by Adryan Eka Vandra, organized by career phase.',
      path: '/portfolio',
    }),
    links: [
      canonicalLink('/portfolio'),
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=DM+Mono:wght@400;500&display=swap',
      },
    ],
  }),
})

function PortfolioPage() {
  return <WorkIndex categories={Route.useLoaderData()} />
}
