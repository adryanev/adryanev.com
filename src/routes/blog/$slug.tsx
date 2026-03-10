import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { Calendar, Clock, ArrowLeft, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPublishedPostBySlug } from '@/server/functions/public.functions'

export const Route = createFileRoute('/blog/$slug')({
  loader: async ({ params }) => {
    const post = await getPublishedPostBySlug({ data: { slug: params.slug } })
    if (!post) throw notFound()
    return post
  },
  component: BlogPostPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
      <p className="font-mono text-6xl font-bold text-accent">404</p>
      <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Post not found</p>
      <Link to="/blog" className="mt-6 inline-block text-accent hover:underline">
        Back to blog
      </Link>
    </div>
  ),
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.title} — Adryan Eka Vandra` : 'Post Not Found' },
      {
        name: 'description',
        content: loaderData?.excerpt ?? '',
      },
      { property: 'og:title', content: loaderData?.title ?? '' },
      { property: 'og:description', content: loaderData?.excerpt ?? '' },
      { property: 'og:type', content: 'article' },
      ...(loaderData?.coverImage
        ? [{ property: 'og:image', content: loaderData.coverImage }]
        : []),
    ],
  }),
})

function BlogPostPage() {
  const post = Route.useLoaderData()

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link
        to="/blog"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-accent"
      >
        <ArrowLeft className="h-3 w-3" /> Back to blog
      </Link>

      {post.coverImage && (
        <img
          src={post.coverImage}
          alt={post.title}
          className="mt-6 w-full rounded-lg object-cover"
        />
      )}

      <h1 className="mt-6 text-3xl font-bold sm:text-4xl">{post.title}</h1>

      <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
        {post.publishedAt && (
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(post.publishedAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {post.readingTime} min read
        </span>
      </div>

      {post.postsToTags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {post.postsToTags.map((pt) => (
            <Link
              key={pt.tag.id}
              to="/blog"
              search={{ tag: pt.tag.slug }}
              className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent hover:bg-accent/20"
            >
              {pt.tag.name}
            </Link>
          ))}
        </div>
      )}

      {/* Rendered markdown content */}
      <div
        className={cn(
          'prose prose-slate dark:prose-invert mt-10 max-w-none',
          'prose-headings:font-bold prose-a:text-accent prose-a:no-underline hover:prose-a:underline',
          'prose-code:rounded prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:text-sm prose-code:font-normal',
          'dark:prose-code:bg-slate-800',
          'prose-pre:bg-transparent prose-pre:p-0',
        )}
        dangerouslySetInnerHTML={{ __html: post.html }}
      />

      {/* Prev/Next navigation */}
      <div className="mt-16 flex items-center justify-between border-t border-slate-200 pt-8 dark:border-slate-800">
        {post.prev ? (
          <Link
            to="/blog/$slug"
            params={{ slug: post.prev.slug }}
            className="group flex items-center gap-2 text-sm text-slate-600 hover:text-accent dark:text-slate-400"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="line-clamp-1">{post.prev.title}</span>
          </Link>
        ) : (
          <div />
        )}
        {post.next ? (
          <Link
            to="/blog/$slug"
            params={{ slug: post.next.slug }}
            className="group flex items-center gap-2 text-sm text-slate-600 hover:text-accent dark:text-slate-400"
          >
            <span className="line-clamp-1">{post.next.title}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </article>
  )
}
