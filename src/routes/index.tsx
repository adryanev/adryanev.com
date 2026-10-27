import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { useRef } from 'react'
import { useEntrance } from '@/components/motion/Reveal'
import { PortfolioScene3D } from '@/components/home/PortfolioScene3D'
import { getHomePageData } from '@/server/functions/public.functions'
import { seoMeta, canonicalLink } from '@/lib/seo'

import { Button } from '@/components/ui'
export const Route = createFileRoute('/')({
  loader: () => getHomePageData(),
  component: HomePage,
  head: () => ({
    meta: seoMeta({
      title: 'Adryan Eka Vandra — Software Engineer',
      path: '/',
    }),
    links: [canonicalLink('/')],
  }),
})

function HomePage() {
  const homeRef = useRef<HTMLDivElement>(null)
  useEntrance(homeRef, { selector: '[data-enter]', stagger: 0.06 })
  const { latestPosts, featuredProjects } = Route.useLoaderData()
  const [leadProject, ...supportingProjects] = featuredProjects

  return (
    <div ref={homeRef} className="adventure-home">
      <section className="adventure-hero" aria-labelledby="intro-title">
        <div className="adventure-hero__copy" data-enter="bubble">
          <p className="adventure-eyebrow">Software engineer · Pekanbaru</p>
          <h1 id="intro-title">
            Hi, I'm <em>Adryan.</em>
          </h1>
          <p className="adventure-hero__summary">
            I work on mobile apps, backend systems, and delivery infrastructure.
          </p>
          <div className="adventure-actions">
            <Button asChild variant="primary" size="feature">
              <a href="#selected-work">
                See my work
                <ArrowRight aria-hidden="true" />
              </a>
            </Button>
            <Button asChild variant="accent" size="feature">
              <Link to="/contact">Get in touch</Link>
            </Button>
          </div>
        </div>

        <PortfolioScene3D />
      </section>

      {leadProject ? (
        <section
          className="adventure-work"
          data-enter="panel"
          id="selected-work"
          aria-labelledby="selected-work-title"
        >
          <Link
            to="/portfolio/$category/$slug"
            params={{
              category: leadProject.category.slug,
              slug: leadProject.slug,
            }}
            className="adventure-work__lead"
            data-project-card
          >
            <div>
              <span className="adventure-label">
                Featured work · {leadProject.year.toString()}
              </span>
              <h2 id="selected-work-title">{leadProject.title}</h2>
              <p>
                {leadProject.role} · {leadProject.workplace}
              </p>
            </div>
            <div className="adventure-work__evidence">
              <div className="adventure-tags" aria-label="Technologies">
                {leadProject.technology
                  .slice(0, 5)
                  .map((technology: string) => (
                    <span key={technology}>{technology}</span>
                  ))}
              </div>
              <span className="adventure-work__link">
                Open case study
                <ArrowRight aria-hidden="true" />
              </span>
            </div>
          </Link>

          {supportingProjects.length > 0 ? (
            <div
              className="adventure-work__index"
              aria-label="More selected work"
            >
              {supportingProjects.map((project) => (
                <Link
                  key={project.id}
                  to="/portfolio/$category/$slug"
                  params={{
                    category: project.category.slug,
                    slug: project.slug,
                  }}
                  data-project-card
                >
                  <span className="adventure-label">
                    {project.year.toString()} · {project.category.name}
                  </span>
                  <h3>{project.title}</h3>
                  <p>
                    {project.role} · {project.workplace}
                  </p>
                  <span className="adventure-work__link">
                    View project
                    <ArrowRight aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      <section
        className="adventure-closing"
        data-enter="panel"
        aria-label="Writing and contact"
      >
        <article className="adventure-writing">
          <p className="adventure-eyebrow">Writing</p>
          <h2>I write about the work.</h2>
          <p>
            Technical notes, project decisions, and operational documentation.
          </p>
          {latestPosts.length > 0 ? (
            <ul className="adventure-writing__list">
              {latestPosts.map((post) => (
                <li key={post.id}>
                  <Link to="/blog/$slug" params={{ slug: post.slug }}>
                    <span>{post.title}</span>
                    <time dateTime={post.publishedAt?.toISOString()}>
                      {post.publishedAt
                        ? new Intl.DateTimeFormat('en', {
                            month: 'short',
                            year: 'numeric',
                          }).format(new Date(post.publishedAt))
                        : 'Draft'}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          <Link
            className="adventure-text-link"
            to="/blog"
            search={{ page: undefined, tag: undefined }}
          >
            Browse writing
            <ArrowRight aria-hidden="true" />
          </Link>
        </article>

        <Link className="adventure-contact" to="/contact">
          <span className="adventure-eyebrow">Contact</span>
          <h2>Have something to discuss?</h2>
          <p>
            Send a note about the role, project, or problem you're working on.
          </p>
          <span className="adventure-contact__link">
            Get in touch
            <ArrowRight aria-hidden="true" />
          </span>
        </Link>
      </section>
    </div>
  )
}
