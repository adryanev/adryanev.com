import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Calendar, Clock, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPublishedPosts, getAllTags } from '@/server/functions/public.functions'
import { estimateReadingTime } from '@/lib/markdown'

export const Route = createFileRoute('/blog/')({
  validateSearch: (search: Record<string, unknown>) => ({
    page: Number(search.page) || 1,
    tag: (search.tag as string) || undefined,
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const [data, tags] = await Promise.all([
      getPublishedPosts({ data: { page: deps.page, tag: deps.tag } }),
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
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold">Blog</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        {total} post{total !== 1 ? 's' : ''}
        {currentTag && (
          <span>
            {' '}tagged with{' '}
            <span className="font-medium text-accent">{currentTag}</span>
          </span>
        )}
      </p>

      {/* Tag filter */}
      {tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => navigate({ search: {} })}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              !currentTag
                ? 'bg-accent text-slate-950'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700',
            )}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => navigate({ search: { tag: tag.slug } })}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                currentTag === tag.slug
                  ? 'bg-accent text-slate-950'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700',
              )}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {/* Post list */}
      {posts.length === 0 ? (
        <div className="mt-12 text-center text-slate-500">
          No posts yet. Check back soon!
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className={cn(
                'group block rounded-lg border p-6 transition-colors',
                'border-slate-200 hover:border-accent/30 hover:bg-accent/5',
                'dark:border-slate-800 dark:hover:border-accent/30 dark:hover:bg-accent/5',
              )}
            >
              {post.coverImage && (
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="mb-4 h-48 w-full rounded-md object-cover"
                  loading="lazy"
                />
              )}
              <h2 className="text-xl font-semibold group-hover:text-accent">
                {post.title}
              </h2>
              <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                {post.publishedAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {estimateReadingTime(post.content)} min read
                </span>
              </div>
              {post.excerpt && (
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                  {post.excerpt}
                </p>
              )}
              {post.postsToTags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {post.postsToTags.map((pt) => (
                    <span
                      key={pt.tag.id}
                      className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    >
                      {pt.tag.name}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {page > 1 && (
            <button
              onClick={() => navigate({ search: { page: page - 1, tag: currentTag } })}
              className="rounded-md border border-slate-200 px-4 py-2 text-sm hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800"
            >
              Previous
            </button>
          )}
          <span className="flex items-center px-3 text-sm text-slate-500">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <button
              onClick={() => navigate({ search: { page: page + 1, tag: currentTag } })}
              className="rounded-md border border-slate-200 px-4 py-2 text-sm hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800"
            >
              Next
            </button>
          )}
        </div>
      )}
    </div>
  )
}
