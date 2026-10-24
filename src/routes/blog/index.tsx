import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import {
  getPublishedPosts,
  getAllTags,
} from '@/server/functions/public.functions'
import { seoMeta, canonicalLink } from '@/lib/seo'
import { SubscribeForm } from '@/components/newsletter/SubscribeForm'

import { PageHeader, Button, EmptyState } from '@/components/ui'
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
    meta: seoMeta({
      title: 'Blog — Adryan Eka Vandra',
      description:
        'Technical blog posts about software engineering, web development, and more.',
      path: '/blog',
    }),
    links: [canonicalLink('/blog')],
  }),
})

function BlogListPage() {
  const { posts, page, totalPages, tags, currentTag } =
    Route.useLoaderData()
  const navigate = Route.useNavigate()

  return (
    <div className="chapter-page chapter-blog mx-auto">
      <PageHeader variant="chapter">
        <h1>Writing</h1>
        <p>Notes on engineering, design, and the work behind software.</p>
      </PageHeader>
      {tags.length > 0 && (
        <nav className="topic-filters" aria-label="Filter articles by topic">
          <Button
            variant="secondary"
            aria-pressed={!currentTag}
            onClick={() =>
              navigate({ search: { page: undefined, tag: undefined } })
            }
          >
            All articles
          </Button>
          {tags.map((tag) => (
            <Button
              variant="secondary"
              key={tag.id}
              aria-pressed={currentTag === tag.slug}
              onClick={() =>
                navigate({ search: { page: undefined, tag: tag.slug } })
              }
            >
              {tag.name} <span>({tag.postCount})</span>
            </Button>
          ))}
        </nav>
      )}
      {posts.length === 0 ? (
        <EmptyState>
          <h2>
            {currentTag
              ? 'No articles for this topic'
              : 'No articles published yet'}
          </h2>
          <p>
            {currentTag
              ? 'Choose another topic or browse all articles.'
              : 'New articles will appear here when they are published.'}
          </p>
          {currentTag && (
            <Button
              variant="secondary"
              size="lg"
              onClick={() =>
                navigate({ search: { page: undefined, tag: undefined } })
              }
            >
              Show all articles
            </Button>
          )}
        </EmptyState>
      ) : (
        <div className="writing-index">
          {posts.map((post) => (
            <article className="writing-entry" key={post.id}>
              <div className="writing-entry__meta">
                {post.publishedAt && (
                  <time dateTime={new Date(post.publishedAt).toISOString()}>
                    {new Intl.DateTimeFormat('en', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    }).format(new Date(post.publishedAt))}
                  </time>
                )}
                {post.views > 0 && (
                  <span>{post.views.toLocaleString()} views</span>
                )}
              </div>
              <h2>
                <Link to="/blog/$slug" params={{ slug: post.slug }}>
                  {post.title}
                </Link>
              </h2>
              {post.excerpt && <p>{post.excerpt}</p>}
              <div className="writing-entry__topics">
                {post.postsToTags.map((pt) => (
                  <span key={pt.tag.id}>{pt.tag.name}</span>
                ))}
              </div>
              <Link
                className="writing-entry__link"
                to="/blog/$slug"
                params={{ slug: post.slug }}
              >
                Read article <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <nav className="page-pagination" aria-label="Article pages">
          <Button
            variant="secondary"
            size="lg"
            disabled={page <= 1}
            onClick={() =>
              navigate({
                search: { page: page - 1, tag: currentTag ?? undefined },
              })
            }
          >
            Previous
          </Button>
          <span aria-current="page">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="lg"
            disabled={page >= totalPages}
            onClick={() =>
              navigate({
                search: { page: page + 1, tag: currentTag ?? undefined },
              })
            }
          >
            Next
          </Button>
        </nav>
      )}
      <SubscribeForm />
    </div>
  )
}
