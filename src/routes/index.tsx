import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { useRef } from 'react'
import { useEntrance } from '@/components/motion/Reveal'
import { PortfolioScene3D } from '@/components/home/PortfolioScene3D'
import { ProjectMetric } from '@/components/work/ProjectMetric'
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

type HomeData = Awaited<ReturnType<typeof getHomePageData>>
type FeaturedProject = HomeData['featuredProjects'][number]
type LatestPost = HomeData['latestPosts'][number]

const LEAD_PROJECT_SCREENS = 3

const monthYear = new Intl.DateTimeFormat('en', {
  month: 'short',
  year: 'numeric',
})

function projectImageAlt(
  project: FeaturedProject,
  image: FeaturedProject['images'][number],
  index: number,
) {
  return image.alt || `${project.title}, project image ${index + 1}`
}

function HomePage() {
  const homeRef = useRef<HTMLDivElement>(null)
  useEntrance(homeRef, { selector: '[data-enter]', stagger: 0.06 })
  const { latestPosts, featuredProjects } = Route.useLoaderData()
  const [leadProject, ...moreProjects] = featuredProjects

  return (
    <div ref={homeRef} className="adventure-home">
      <section className="adventure-hero" aria-labelledby="intro-title">
        <div className="adventure-hero__copy">
          <h1 id="intro-title">
            Hi, I'm <em>Adryan.</em>
          </h1>
          <p className="adventure-hero__summary">
            I'm a software engineer in Pekanbaru. I work on mobile apps,
            backend systems, and delivery infrastructure.
          </p>
          <div className="adventure-actions">
            <Button asChild variant="primary">
              <a href="#selected-work">
                See my work
                <ArrowRight aria-hidden="true" />
              </a>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/contact">Get in touch</Link>
            </Button>
          </div>
        </div>

        <PortfolioScene3D />
      </section>

      {leadProject ? (
        <section
          className="home-work"
          id="selected-work"
          aria-labelledby="selected-work-title"
        >
          <div className="home-section-head">
            <h2 id="selected-work-title">Selected work</h2>
            <Link className="home-link" to="/portfolio">
              All work
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <LeadProject project={leadProject} />
          {moreProjects.length > 0 ? (
            <>
              <p className="home-eyebrow home-more-label">More work</p>
              <div className="home-pair">
                {moreProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </>
          ) : null}
        </section>
      ) : null}

      <WritingList posts={latestPosts} />

      <section
        className="home-band"
        aria-labelledby="contact-band-title"
        data-enter="panel"
      >
        <div>
          <h2 id="contact-band-title">Have something to discuss?</h2>
          <p>
            Send a note about the role, project, or problem you're working on.
          </p>
        </div>
        <Link className="home-band__button" to="/contact">
          Get in touch
          <ArrowRight aria-hidden="true" />
        </Link>
      </section>
    </div>
  )
}

function LeadProject({ project }: { project: FeaturedProject }) {
  const screens = project.images.slice(0, LEAD_PROJECT_SCREENS)
  return (
    <Link
      to="/portfolio/$category/$slug"
      params={{ category: project.category.slug, slug: project.slug }}
      className="home-lead"
      data-solo={screens.length === 0 || undefined}
      data-enter="panel"
    >
      <div className="home-lead__copy">
        <h3>{project.title}</h3>
        <p className="home-meta-line">
          {project.role}{' '}
          <span>
            · {project.workplace} · {project.year}
          </span>
        </p>
        {project.summary ? <p>{project.summary}</p> : null}
        {project.metrics.length > 0 ? (
          <div className="home-lead__metrics">
            {project.metrics.map((metric, index) => (
              <ProjectMetric key={index} metric={metric} />
            ))}
          </div>
        ) : null}
        <span className="home-lead__cta">
          Open case study
          <ArrowRight aria-hidden="true" />
        </span>
      </div>
      {screens.length > 0 ? (
        <div className="home-lead__screens">
          {screens.map((image, index) => (
            <img
              key={image.id}
              src={image.url}
              alt={projectImageAlt(project, image, index)}
              loading="lazy"
              decoding="async"
            />
          ))}
        </div>
      ) : null}
    </Link>
  )
}

function ProjectCard({ project }: { project: FeaturedProject }) {
  const [cover] = project.images
  const [metric] = project.metrics
  return (
    <Link
      to="/portfolio/$category/$slug"
      params={{ category: project.category.slug, slug: project.slug }}
      className="home-card"
      data-enter="panel"
    >
      <div className="home-card__shot">
        {cover ? (
          <img
            src={cover.url}
            alt={projectImageAlt(project, cover, 0)}
            loading="lazy"
            decoding="async"
          />
        ) : null}
      </div>
      <div className="home-card__body">
        <p className="home-eyebrow">
          {project.year} · {project.workplace}
        </p>
        <h3>{project.title}</h3>
        <p className="home-card__role">{project.role}</p>
        {metric ? (
          <ProjectMetric metric={metric} />
        ) : (
          <span className="home-card__open">
            View project
            <ArrowRight aria-hidden="true" />
          </span>
        )}
      </div>
    </Link>
  )
}

function WritingList({ posts }: { posts: LatestPost[] }) {
  return (
    <section className="home-writing" aria-labelledby="writing-title">
      <div>
        <p className="home-eyebrow">Writing</p>
        <h2 id="writing-title">I write about the work.</h2>
        <p className="home-writing__intro">
          Technical notes, project decisions, and operational documentation.
        </p>
      </div>
      <div>
        {posts.length > 0 ? (
          <ul className="home-writing__list">
            {posts.map((post) => (
              <li key={post.id}>
                <Link to="/blog/$slug" params={{ slug: post.slug }}>
                  {post.publishedAt ? (
                    <time dateTime={post.publishedAt.toISOString()}>
                      {monthYear.format(post.publishedAt)}
                    </time>
                  ) : (
                    <span />
                  )}
                  <div>
                    <h3>{post.title}</h3>
                    {post.excerpt ? <p>{post.excerpt}</p> : null}
                  </div>
                  <ArrowRight aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="home-writing__empty">No articles yet.</p>
        )}
        <Link
          className="home-link"
          to="/blog"
          search={{ page: undefined, tag: undefined }}
        >
          Browse writing
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
