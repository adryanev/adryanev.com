import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Terminal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getHomePageData } from '@/server/functions/public.functions'
import { Reveal, StaggerChildren, StaggerItem } from '@/components/motion/Reveal'
import { TextReveal } from '@/components/motion/TextReveal'
import { seoMeta, canonicalLink } from '@/lib/seo'

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

type Post = {
  id: number
  slug: string
  title: string
  publishedAt: Date | null
  excerpt: string | null
  postsToTags: { tag: { id: number; name: string } }[]
}

type Project = {
  id: number
  title: string
  slug: string
  role: string
  workplace: string
  year: number
  technology: string[]
  category: { slug: string; name: string }
}

type Saas = {
  id: number
  name: string
  description: string
  status: string
  url: string | null
  logoUrl: string | null
}

function HomePage() {
  const { latestPosts, featuredProjects, activeSaas } = Route.useLoaderData()

  return (
    <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center overflow-hidden px-6 py-12 md:py-24 space-y-32">
      {/* Hero Section */}
      <div className="relative z-10 grid gap-12 lg:grid-cols-[1fr_400px]">
        <div className="flex flex-col justify-center">
          <Reveal delay={0}>
            <div className="mb-8 inline-flex w-fit items-center gap-3 border-[2px] border-text-primary bg-accent px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-accent-fg brutal-shadow">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping motion-reduce:animate-none rounded-full bg-bg-primary opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-bg-primary"></span>
              </span>
              Available for Work
            </div>
          </Reveal>

          <h1 className="font-serif text-6xl font-medium leading-[1.05] tracking-tight md:text-8xl lg:text-[10rem]">
            <TextReveal text="Software" delay={0.1} />
            <br />
            <span className="italic text-accent">
              <TextReveal text="Engineer." delay={0.3} />
            </span>
          </h1>

          <Reveal delay={0.5}>
            <p className="mt-10 max-w-xl font-mono text-base leading-relaxed text-text-secondary md:text-lg">
              I'm Adryan Eka Vandra. I build resilient, high-performance systems and distinctive user interfaces. No generic boilerplate — just crafted software.
            </p>
          </Reveal>

          <Reveal delay={0.65}>
            <div className="mt-12 flex flex-wrap items-center gap-6">
              <Link
                to="/portfolio"
                className="group flex items-center gap-3 bg-text-primary px-8 py-4 font-mono text-sm font-bold uppercase tracking-widest text-bg-primary transition-all hover:bg-accent hover:text-accent-fg brutal-border border-text-primary"
              >
                View Work
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/about"
                className="group flex items-center gap-3 bg-bg-secondary px-8 py-4 font-mono text-sm font-bold uppercase tracking-widest text-text-primary transition-all hover:border-accent hover:text-accent brutal-border"
              >
                About Me
              </Link>
            </div>
          </Reveal>
        </div>

        <Reveal direction="right" delay={0.4} className="hidden lg:flex flex-col justify-center">
          <div className="brutal-border brutal-shadow-lg bg-bg-secondary p-8 relative">
            <div className="absolute -top-3 -right-3 h-6 w-6 border-2 border-text-primary bg-accent" />
            <div className="mb-6 flex items-center gap-3 border-b-2 border-border pb-4">
              <Terminal className="h-5 w-5 text-text-primary" />
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-text-primary">
                adryanev@web ~
              </span>
            </div>
            <div className="font-mono text-sm leading-loose text-text-secondary space-y-1">
              <p><span className="text-accent font-bold">$</span> init --sequence start</p>
              <p className="text-text-primary">{'>'} Booting core modules...</p>
              <p><span className="text-accent font-bold">$</span> load --module skills</p>
              <p className="text-text-primary">{'>'} React, Node.js, Go, Postgres</p>
              <p><span className="text-accent font-bold">$</span> status</p>
              <p className="text-accent font-bold animate-pulse motion-reduce:animate-none">{'>'} Awaiting input_</p>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Latest Blog Posts — #2: stronger card borders, #7: softer dividers, #9: better tag contrast */}
      {latestPosts.length > 0 && (
        <section className="border-t-2 border-text-primary dark:border-border pt-16">
          <Reveal>
            <SectionHeader
              title="Latest Posts"
              linkTo="/blog"
              linkLabel="All Posts"
            />
          </Reveal>
          <StaggerChildren className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {latestPosts.map((post: Post) => (
              <StaggerItem key={post.id}>
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="group flex h-full flex-col justify-between brutal-border bg-bg-secondary p-8 transition-all hover:-translate-y-1 hover:brutal-shadow"
                >
                  <div>
                    <time className="font-mono text-sm font-bold text-accent uppercase tracking-widest">
                      {post.publishedAt
                        ? new Intl.DateTimeFormat('en-CA').format(new Date(post.publishedAt)).replace(/-/g, '.')
                        : 'DRAFT'}
                    </time>
                    <h3 className="mt-4 font-serif text-3xl font-bold leading-tight group-hover:italic transition-all">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="mt-4 font-sans text-text-secondary line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                  <div className="mt-8 flex flex-wrap gap-2">
                    {post.postsToTags.map((pt) => (
                      <span
                        key={pt.tag.id}
                        className="bg-bg-primary px-2 py-1 font-mono text-xs uppercase tracking-widest text-text-primary border border-border"
                      >
                        {pt.tag.name}
                      </span>
                    ))}
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </section>
      )}

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="border-t-2 border-text-primary dark:border-border pt-16">
          <Reveal>
            <SectionHeader
              title="Featured Projects"
              linkTo="/portfolio"
              linkLabel="All Projects"
            />
          </Reveal>
          <StaggerChildren className="mt-12 grid gap-8 md:grid-cols-2">
            {featuredProjects.map((project: Project) => (
              <StaggerItem key={project.id}>
                <Link
                  to="/portfolio/$category"
                  params={{ category: project.category.slug }}
                  className="group flex h-full flex-col justify-between brutal-border bg-bg-secondary p-8 transition-all hover:-translate-y-1 hover:brutal-shadow"
                >
                  <div>
                    <div className="flex items-start justify-between border-b-2 border-border pb-4 group-hover:border-text-primary transition-colors">
                      <div>
                        <h3 className="font-serif text-4xl font-bold leading-tight group-hover:italic transition-all">
                          {project.title}
                        </h3>
                        <p className="mt-2 font-mono text-sm text-text-secondary">
                          {project.role} · {project.workplace} · {project.year.toString()}
                        </p>
                      </div>
                      <span className="bg-accent px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest text-accent-fg brutal-border">
                        {project.category.name}
                      </span>
                    </div>
                  </div>
                  <div className="mt-8 flex flex-wrap gap-2">
                    {project.technology.slice(0, 5).map((tech) => (
                      <span
                        key={tech}
                        className="bg-bg-primary px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-text-primary border border-border group-hover:text-accent transition-colors"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </section>
      )}

      {/* Active SaaS — #5: show "Coming Soon" when no URL */}
      {activeSaas.length > 0 && (
        <section className="border-t-2 border-text-primary dark:border-border pt-16">
          <Reveal>
            <SectionHeader
              title="Products"
              linkTo="/saas"
              linkLabel="All Products"
            />
          </Reveal>
          <StaggerChildren className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {activeSaas.map((saas: Saas) => (
              <StaggerItem key={saas.id}>
                <div className="group flex h-full flex-col justify-between brutal-border bg-bg-secondary p-8">
                  <div>
                    <div className="flex items-center gap-4 border-b-2 border-border pb-4">
                      {saas.logoUrl && (
                        <img
                          src={saas.logoUrl}
                          alt={saas.name}
                          loading="lazy"
                          className="h-10 w-10 brutal-border bg-bg-primary"
                        />
                      )}
                      <h3 className="font-serif text-2xl font-bold">{saas.name}</h3>
                      <StatusBadge status={saas.status} />
                    </div>
                    <p className="mt-6 font-sans text-text-secondary line-clamp-3">
                      {saas.description}
                    </p>
                  </div>
                  {saas.url ? (
                    <a
                      href={saas.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-8 inline-flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-widest text-text-primary hover:text-accent transition-colors"
                    >
                      Visit <ArrowRight className="h-4 w-4" />
                    </a>
                  ) : (
                    <span className="mt-8 inline-flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-text-secondary">
                      Coming Soon
                    </span>
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </section>
      )}

      {/* #4: Moved watermark behind hero only, not overlapping content sections */}
      <div className="pointer-events-none absolute top-[60vh] right-0 overflow-hidden opacity-[0.02] z-0">
        <span className="font-serif text-[25vw] font-bold leading-none tracking-tighter">
          ADRYAN
        </span>
      </div>
    </div>
  )
}

function SectionHeader({
  title,
  linkTo,
  linkLabel,
}: {
  title: string
  linkTo: string
  linkLabel: string
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-serif text-3xl font-bold italic text-text-primary md:text-4xl">{title}</h2>
      <Link
        to={linkTo}
        className="group flex items-center gap-2 bg-bg-secondary px-6 py-3 font-mono text-sm font-bold uppercase tracking-widest text-text-primary transition-colors hover:text-accent active:scale-95 brutal-border"
      >
        {linkLabel} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
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
        'ml-auto px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest brutal-border',
        colors[status] ?? colors.active,
      )}
    >
      {status}
    </span>
  )
}
