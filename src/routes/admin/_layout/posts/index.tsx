import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPosts, deletePost } from '@/server/functions/posts.functions'

export const Route = createFileRoute('/admin/_layout/posts/')({
  loader: () => getPosts(),
  component: PostListPage,
})

function PostListPage() {
  const posts = Route.useLoaderData()
  const router = useRouter()
  const queryClient = useQueryClient()

  const deleteFn = useServerFn(deletePost)
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries()
      router.invalidate()
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight flex items-center gap-2">
            Posts
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Manage your blog articles.
          </p>
        </div>
        <Link
          to="/admin/posts/new"
          className="inline-flex items-center gap-2 border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-sm font-bold uppercase text-[var(--accent-fg)] transition-colors hover:bg-transparent hover:text-[var(--accent)]"
        >
          <Plus className="h-4 w-4" />
          New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="border border-[var(--border-color)] bg-[var(--bg-secondary)] p-12 text-center">
          <FileText className="mx-auto h-8 w-8 text-[var(--text-secondary)] mb-4" />
          <p className="font-semibold text-[var(--text-primary)] uppercase tracking-wider">No posts found</p>
          <Link
            to="/admin/posts/new"
            className="mt-4 inline-block text-sm text-[var(--accent)] hover:underline"
          >
            Create your first post
          </Link>
        </div>
      ) : (
        <div className="border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[var(--text-secondary)] text-xs">Title</th>
                <th className="hidden px-4 py-3 font-semibold uppercase tracking-wider text-[var(--text-secondary)] text-xs sm:table-cell">Status</th>
                <th className="hidden px-4 py-3 font-semibold uppercase tracking-wider text-[var(--text-secondary)] text-xs md:table-cell">Date</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[var(--text-secondary)] text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className="hover:bg-[var(--bg-primary)] transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      to="/admin/posts/$id/edit"
                      params={{ id: String(post.id) }}
                      className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                    >
                      {post.title}
                    </Link>
                    <div className="mt-0.5 text-xs text-[var(--text-secondary)]">
                      /{post.slug}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider border',
                        post.status === 'published'
                          ? 'border-green-500/30 text-green-600 dark:text-green-400 bg-green-500/10'
                          : 'border-yellow-500/30 text-yellow-600 dark:text-yellow-400 bg-yellow-500/10',
                      )}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-[var(--text-secondary)] md:table-cell">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to="/admin/posts/$id/edit"
                        params={{ id: String(post.id) }}
                        className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 border border-transparent hover:border-[var(--accent)] transition-colors"
                        title="Edit"
                        aria-label={`Edit ${post.title}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this post?')) {
                            deleteMutation.mutate(post.id)
                          }
                        }}
                        className="p-1.5 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-colors"
                        title="Delete"
                        aria-label={`Delete ${post.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
