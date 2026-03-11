import { createFileRoute, Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPosts, deletePost } from '@/server/functions/posts.functions'

export const Route = createFileRoute('/admin/_layout/posts/')({
  loader: () => getPosts(),
  component: PostListPage,
})

function PostListPage() {
  const posts = Route.useLoaderData()
  const queryClient = useQueryClient()

  const deleteFn = useServerFn(deletePost)
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries()
      Route.router?.invalidate()
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Posts</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your blog posts
          </p>
        </div>
        <Link
          to="/admin/posts/new"
          className={cn(
            'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
            'bg-accent text-slate-950 hover:bg-accent-hover',
          )}
        >
          <Plus className="h-4 w-4" />
          New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="mt-12 text-center text-slate-500 dark:text-slate-400">
          <p>No posts yet.</p>
          <Link
            to="/admin/posts/new"
            className="mt-2 inline-block text-accent hover:underline"
          >
            Create your first post
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Status</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Date</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className="border-b border-slate-100 dark:border-slate-800/50"
                >
                  <td className="px-4 py-3">
                    <Link
                      to="/admin/posts/$id/edit"
                      params={{ id: String(post.id) }}
                      className="font-medium hover:text-accent"
                    >
                      {post.title}
                    </Link>
                    <div className="mt-0.5 text-xs text-slate-500">
                      /{post.slug}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span
                      className={cn(
                        'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
                        post.status === 'published'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                      )}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-slate-500 dark:text-slate-400 md:table-cell">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        to="/admin/posts/$id/edit"
                        params={{ id: String(post.id) }}
                        className="rounded p-1 text-slate-500 hover:text-accent dark:text-slate-400"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => {
                          if (confirm('Delete this post?')) {
                            deleteMutation.mutate(post.id)
                          }
                        }}
                        className="rounded p-1 text-slate-500 hover:text-red-500 dark:text-slate-400"
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
