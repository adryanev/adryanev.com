import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import type { getRelatedPosts } from '@/server/functions/public.functions'
import { formatPostDate } from '@/lib/post-dates'

type RelatedPost = Awaited<ReturnType<typeof getRelatedPosts>>[number]

export function RelatedPosts({ posts }: { posts: RelatedPost[] }) {
  if (posts.length === 0) return null

  return (
    <section className="related-posts" aria-labelledby="related-posts-heading">
      <h2 id="related-posts-heading">Related articles</h2>
      <div className="related-posts__list">
        {posts.map((post) => (
          <article className="writing-entry" key={post.id}>
            {post.publishedAt && (
              <div className="writing-entry__meta">
                <time dateTime={new Date(post.publishedAt).toISOString()}>
                  {formatPostDate(post.publishedAt)}
                </time>
              </div>
            )}
            <h3>
              <Link to="/blog/$slug" params={{ slug: post.slug }}>
                {post.title}
              </Link>
            </h3>
            {post.excerpt && <p>{post.excerpt}</p>}
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
    </section>
  )
}
