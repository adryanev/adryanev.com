import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import type {
  getAllTags,
  getPublishedPosts,
} from '@/server/functions/public.functions'
import { Button, EmptyState } from '@/components/ui'

type PublishedPosts = Awaited<ReturnType<typeof getPublishedPosts>>
type Tags = Awaited<ReturnType<typeof getAllTags>>

interface PostListingProps {
  posts: PublishedPosts['posts']
  page: number
  totalPages: number
  tags: Tags
  currentTag?: string
}

// The router sets aria-current on the matching filter; ignore ?page so later pages keep it
const FILTER_ACTIVE_OPTIONS = { exact: true, includeSearch: false }

// Previous/Next never point at the page being viewed, so they must not claim aria-current
const PAGE_ACTIVE_OPTIONS = { exact: true, includeSearch: true }

const shortDate = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export function PostListing({
  posts,
  page,
  totalPages,
  tags,
  currentTag,
}: PostListingProps) {
  return (
    <>
      {tags.length > 0 && (
        <nav className="topic-filters" aria-label="Filter articles by topic">
          <Button asChild variant="secondary">
            <Link to="/blog" activeOptions={FILTER_ACTIVE_OPTIONS}>
              All articles
            </Link>
          </Button>
          {tags.map((tag) => (
            <Button asChild variant="secondary" key={tag.id}>
              <Link
                to="/blog/tag/$tag"
                params={{ tag: tag.slug }}
                activeOptions={FILTER_ACTIVE_OPTIONS}
              >
                {tag.name} <span>({tag.postCount})</span>
              </Link>
            </Button>
          ))}
        </nav>
      )}
      {posts.length === 0 ? (
        <EmptyState>
          <h2>No articles published yet</h2>
          <p>New articles will appear here when they are published.</p>
        </EmptyState>
      ) : (
        <div className="writing-index">
          {posts.map((post) => (
            <article className="writing-entry" key={post.id}>
              <div className="writing-entry__meta">
                {post.publishedAt && (
                  <time dateTime={new Date(post.publishedAt).toISOString()}>
                    {shortDate.format(new Date(post.publishedAt))}
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
                  <Link
                    key={pt.tag.id}
                    to="/blog/tag/$tag"
                    params={{ tag: pt.tag.slug }}
                  >
                    {pt.tag.name}
                  </Link>
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
          <PageButton
            currentTag={currentTag}
            page={page - 1}
            disabled={page <= 1}
            rel="prev"
          >
            Previous
          </PageButton>
          <span aria-current="page">
            Page {page} of {totalPages}
          </span>
          <PageButton
            currentTag={currentTag}
            page={page + 1}
            disabled={page >= totalPages}
            rel="next"
          >
            Next
          </PageButton>
        </nav>
      )}
    </>
  )
}

function PageButton({
  currentTag,
  page,
  disabled,
  rel,
  children,
}: {
  currentTag?: string
  page: number
  disabled: boolean
  rel: 'prev' | 'next'
  children: string
}) {
  if (disabled) {
    return (
      <Button variant="secondary" size="lg" disabled>
        {children}
      </Button>
    )
  }
  const search = { page: page > 1 ? page : undefined }
  if (currentTag) {
    return (
      <Button asChild variant="secondary" size="lg">
        <Link
          to="/blog/tag/$tag"
          params={{ tag: currentTag }}
          search={search}
          rel={rel}
          activeOptions={PAGE_ACTIVE_OPTIONS}
        >
          {children}
        </Link>
      </Button>
    )
  }
  return (
    <Button asChild variant="secondary" size="lg">
      <Link
        to="/blog"
        search={search}
        rel={rel}
        activeOptions={PAGE_ACTIVE_OPTIONS}
      >
        {children}
      </Link>
    </Button>
  )
}
