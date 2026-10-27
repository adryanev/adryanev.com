import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowUpRight, Github, Linkedin, Mail } from 'lucide-react'
import { AboutSystemModel } from '@/components/about/AboutSystemModel'
import { seoMeta, canonicalLink } from '@/lib/seo'
import './about.css'

import { Button } from '@/components/ui'
export const Route = createFileRoute('/about')({
  component: AboutPage,
  head: () => ({
    meta: seoMeta({
      title: 'About — Adryan Eka Vandra',
      description:
        'About Adryan Eka Vandra — Software Engineer specializing in web and mobile development.',
      path: '/about',
    }),
    links: [canonicalLink('/about')],
  }),
})

const selectedWork = [
  {
    workplace: 'Lexicon',
    role: 'Technical Co-founder',
    title: 'Lexicon Beneficial Ownership',
    category: 'lexicon',
    slug: 'lexicon-beneficial-ownership',
  },
  {
    workplace: 'SawitPRO',
    role: 'Software Engineer, Mobile',
    title: 'AgenPRO',
    category: 'work',
    slug: 'agenpro',
  },
  {
    workplace: 'EngageMedia',
    role: 'DevOps Lead',
    title: 'Cinemata',
    category: 'work',
    slug: 'cinemata',
  },
] as const

const practices = [
  {
    name: 'Applications',
    description: 'Interfaces for web and mobile.',
    tools: 'React · Flutter · Swift · Kotlin',
  },
  {
    name: 'Backend',
    description: 'APIs and data services.',
    tools: 'TypeScript · Go · PostgreSQL · Redis',
  },
  {
    name: 'Delivery',
    description: 'Deployment and operations after release.',
    tools: 'Docker · CI/CD · Linux · Nginx',
  },
] as const

const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/adryanev', icon: Github },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/adryanev',
    icon: Linkedin,
  },
  { label: 'Email', href: 'mailto:me@adryanev.com', icon: Mail },
]

function AboutPage() {
  const [active, setActive] = useState(0)

  return (
    <div className="about-page">
      <div className="about-page__duo">
        <section
          className="about-page__proof"
          aria-labelledby="about-work-title"
        >
          <h1 id="about-work-title">
            Selected
            <br />
            <span>work.</span>
          </h1>
          <div className="about-page__projects">
            {selectedWork.map((project) => (
              <Link
                key={project.slug}
                to="/portfolio/$category/$slug"
                params={{ category: project.category, slug: project.slug }}
                className="about-page__project"
              >
                <span className="about-page__project-meta">
                  {project.workplace} · {project.role}
                </span>
                <strong>{project.title}</strong>
                <ArrowUpRight size={20} strokeWidth={2.2} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>

        <div className="about-page__areas" aria-label="Areas of work">
          <AboutSystemModel active={active} onSelect={setActive} />
          {practices.map((practice, index) => (
            <section
              key={practice.name}
              className="about-page__practice"
              data-focus={active === index ? '' : undefined}
              aria-label={practice.name}
            >
              <h2>{practice.name}</h2>
              <p>{practice.description}</p>
              <span>{practice.tools}</span>
            </section>
          ))}
        </div>
      </div>

      <section className="about-page__bio" aria-labelledby="about-bio-title">
        <div className="about-page__bio-body">
          <h2 id="about-bio-title">I'm Adryan.</h2>
          <p>
            I'm a software engineer based in Indonesia. I work on mobile apps,
            backend systems, and delivery infrastructure. The projects and
            writing here document what I built, the role I played, and the
            decisions behind the work.
          </p>
          <div
            className="about-page__social"
            aria-label="Find Adryan elsewhere"
          >
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('mailto:') ? undefined : '_blank'}
                rel={
                  href.startsWith('mailto:') ? undefined : 'noopener noreferrer'
                }
                aria-label={label}
              >
                <Icon size={17} aria-hidden="true" />
                {label}
              </a>
            ))}
          </div>
        </div>
        <div className="about-page__bio-action">
          <strong>Have something to discuss?</strong>
          <Button asChild size="lg">
            <Link to="/contact">
              Contact me <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>

      <div className="about-page__foot">
        <span>Adryan Eka Vandra · Software Engineer</span>
        <Link to="/resume">
          Full CV <ArrowUpRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
