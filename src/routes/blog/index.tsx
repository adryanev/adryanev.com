import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPublishedPosts, getAllTags } from '@/server/functions/public.functions'
import { Reveal, StaggerChildren, StaggerItem } from '@/components/motion/Reveal'

export const Route = createFileRoute('/blog/')({
  validateSearch: (search: Record<string, unknown>) => ({
    page: search.page ? Number(search.page) : undefined,
    tag: (search.tag as string) || undefined,
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const page = deps.page ?? 1
    const [data, tags] = await Promise.all([
      getPublishedPosts({ data: { page, tag: deps.tag } }),
      getAllTags(),
    ])
    return { ...data, tags, currentTag: deps.tag }
  },
  component: BlogListPage,
  head: () => ({
    meta: [
      { title: 'Blog — Adryan Eka Vandra' },
      {
        name: 'description',
        content: 'Technical blog posts about software engineering, web development, and more.',
      },
    ],
  }),
})

function BlogListPage() {
  const { posts, total, page, totalPages, tags, currentTag } = Route.useLoaderData()
  const navigate = Route.useNavigate()

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 md:py-24">
      <Reveal>
        <div className="mb-16 border-b-4 border-text-primary pb-8">
          <h1 className="font-serif text-6xl font-medium tracking-tight md:text-8xl lg:text-[10rem] uppercase">
            Blog
          </h1>
          <div className="mt-8 flex items-center gap-4">
            <div className="h-4 w-4 bg-accent brutal-border" />
            <span className="font-mono text-sm text-text-secondary tracking-wider">
              Engineering & Design
            </span>
          </div>
        </div>
      </Reveal>

      {/* Tag filter */}
      {tags.length > 0 && (
        <Reveal delay={0.1}>
          <div className="mb-12 flex flex-wrap gap-3">
            <button
              onClick={() => navigate({ search: { page: undefined, tag: undefined } })}
              className={cn(
                'px-4 py-2 font-mono text-sm brutal-border transition-colors',
                !currentTag
                  ? 'bg-text-primary text-bg-primary'
                  : 'bg-bg-secondary text-text-primary hover:text-accent hover:border-accent'
              )}
            >
              All [{total}]
            </button>
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => navigate({ search: { page: undefined, tag: tag.slug } })}
                className={cn(
                  'px-4 py-2 font-mono text-sm brutal-border transition-colors',
                  currentTag === tag.slug
                    ? 'bg-text-primary text-bg-primary'
                    : 'bg-bg-secondary text-text-primary hover:text-accent hover:border-accent'
                )}
              >
                {tag.name} [{tag.postCount}]
              </button>
            ))}
          </div>
        </Reveal>
      )}

      {posts.length === 0 ? (
        <div className="mt-12 text-center text-text-secondary font-serif text-2xl italic">
          No posts found.
        </div>
      ) : (
        <StaggerChildren className="grid gap-10">
          {posts.map((post) => (
            <StaggerItem key={post.id}>
              <article
                className="group relative grid gap-6 brutal-border bg-bg-secondary p-8 transition-all hover:-translate-y-1 hover:brutal-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4 group-hover:border-text-primary transition-colors">
                  <time className="font-mono text-sm font-bold text-accent">
                    {post.publishedAt ? new Intl.DateTimeFormat('en-CA').format(new Date(post.publishedAt)).replace(/-/g, '.') : 'DRAFT'}
                  </time>
                  <div className="flex gap-2">
                    {post.postsToTags.map((pt) => (
                      <span key={pt.tag.id} className="font-mono text-xs text-text-secondary">
                        {pt.tag.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <Link to="/blog/$slug" params={{ slug: post.slug }} className="block">
                    <h2 className="font-serif text-3xl md:text-5xl font-bold leading-tight text-text-primary mb-4 group-hover:italic transition-all">
                      {post.title}
                    </h2>
                  </Link>
                  {post.excerpt && (
                    <p className="font-sans text-lg text-text-secondary max-w-3xl">
                      {post.excerpt}
                    </p>
                  )}
                </div>

                <div className="mt-2 flex">
                  <Link
                    to="/blog/$slug"
                    params={{ slug: post.slug }}
                    className="inline-flex items-center gap-2 font-mono text-sm font-bold text-text-primary hover:text-accent transition-colors"
                  >
                    Read More
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
                  </Link>
                </div>
              </article>
            </StaggerItem>
          ))}
        </StaggerChildren>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Reveal>
          <div className="mt-16 pt-8 border-t-2 border-text-primary flex justify-between items-center">
            {page > 1 ? (
              <button
                onClick={() => navigate({ search: { page: page - 1, tag: currentTag ?? undefined } })}
                className="px-6 py-3 font-mono text-sm font-bold bg-bg-primary brutal-border transition-colors hover:text-accent hover:border-accent"
              >
                &lt; Previous
              </button>
            ) : <div />}
            <span className="font-mono text-sm text-text-secondary tabular-nums">
              Page {page} / {totalPages}
            </span>
            {page < totalPages ? (
              <button
                onClick={() => navigate({ search: { page: page + 1, tag: currentTag ?? undefined } })}
                className="px-6 py-3 font-mono text-sm font-bold bg-bg-primary brutal-border transition-colors hover:text-accent hover:border-accent"
              >
                Next &gt;
              </button>
            ) : <div />}
          </div>
        </Reveal>
      )}
    </div>
  )
}
