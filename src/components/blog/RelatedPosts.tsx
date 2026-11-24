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
      {posts.map((post) => (
        <article className="related-posts__entry" key={post.id}>
          {post.publishedAt && (
            <time dateTime={new Date(post.publishedAt).toISOString()}>
              {formatPostDate(post.publishedAt)}
            </time>
          )}
          <h3>
            <Link to="/blog/$slug" params={{ slug: post.slug }}>
              {post.title}
            </Link>
          </h3>
          <ArrowRight className="related-posts__arrow" size={18} aria-hidden="true" />
          {post.excerpt && <p>{post.excerpt}</p>}
        </article>
      ))}
    </section>
  )
}
