import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, FileText } from 'lucide-react'

import { getPosts, deletePost } from '@/server/functions/posts.functions'

import {
  FormError,
  Button,
  Table,
  TableScroll,
  Badge,
  PageHeader,
  EmptyState,
} from '@/components/ui'

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
      <FormError
        message={
          deleteMutation.isError
            ? 'The item could not be removed. Please try again.'
            : ''
        }
      />
      <PageHeader>
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight flex items-center gap-2">
            Posts
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Manage your blog articles.
          </p>
        </div>
        <Button asChild variant="primary">
          <Link to="/admin/posts/new">
            <Plus className="h-4 w-4" />
            New Post
          </Link>
        </Button>
      </PageHeader>

      {posts.length === 0 ? (
        <EmptyState className="text-center">
          <FileText className="mx-auto h-8 w-8 text-[var(--text-secondary)] mb-4" />
          <p className="font-semibold text-[var(--text-primary)] uppercase tracking-wider">
            No posts found
          </p>
          <Link
            to="/admin/posts/new"
            className="mt-4 inline-block text-sm text-[var(--admin-link)] hover:underline"
          >
            Create your first post
          </Link>
        </EmptyState>
      ) : (
        <TableScroll
          role="region"
          aria-label="Posts table, scroll for all columns"
          tabIndex={0}
        >
          <Table>
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[var(--text-secondary)] text-xs">
                  Title
                </th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[var(--text-secondary)] text-xs ">
                  Status
                </th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[var(--text-secondary)] text-xs ">
                  Date
                </th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[var(--text-secondary)] text-xs text-right">
                  Actions
                </th>
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
                      className="font-medium text-[var(--text-primary)] hover:text-[var(--admin-link)] transition-colors"
                    >
                      {post.title}
                    </Link>
                    <div className="mt-0.5 text-xs text-[var(--text-secondary)]">
                      /{post.slug}
                    </div>
                  </td>
                  <td className="px-4 py-3 ">
                    <Badge
                      tone={post.status === 'published' ? 'success' : 'warning'}
                    >
                      {post.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text-secondary)] ">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild variant="ghost" size="icon">
                        <Link
                          to="/admin/posts/$id/edit"
                          params={{ id: String(post.id) }}
                          title="Edit"
                          aria-label={`Edit ${post.title}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="danger"
                        size="icon"
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                          if (
                            confirm(
                              'Are you sure you want to delete this post?',
                            )
                          ) {
                            deleteMutation.mutate(post.id)
                          }
                        }}
                        title="Delete"
                        aria-label={`Delete ${post.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableScroll>
      )}
    </div>
  )
}
