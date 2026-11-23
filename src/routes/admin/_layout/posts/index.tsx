import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'motion/react'
import { Plus, Pencil } from 'lucide-react'

import { getPosts, deletePost } from '@/server/functions/posts.functions'
import { formatPostDate } from '@/lib/post-dates'
import {
  FormError,
  Button,
  Table,
  TableScroll,
  PageHeader,
  EmptyState,
} from '@/components/ui'
import { ContentStatusBadge } from '@/components/admin/ContentStatusBadge'
import { DeleteAction, RowAction, RowActions } from '@/components/admin/RowActions'
import { rowPresence } from '@/components/admin/motion'

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
    <div>
      <PageHeader>
        <div>
          <h1>Posts</h1>
          <p>Manage your blog articles.</p>
        </div>
        <Button asChild variant="primary">
          <Link to="/admin/posts/new">
            <Plus size={18} aria-hidden="true" />
            New post
          </Link>
        </Button>
      </PageHeader>
      <FormError
        message={
          deleteMutation.isError
            ? 'The post could not be removed. Try again.'
            : ''
        }
      />

      {posts.length === 0 ? (
        <EmptyState>
          <h2>No posts yet</h2>
          <p>
            <Link to="/admin/posts/new" className="underline underline-offset-4">
              Create your first post
            </Link>
          </p>
        </EmptyState>
      ) : (
        <TableScroll aria-label="Posts table, scroll for all columns">
          <Table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Created</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {posts.map((post) => (
                  <motion.tr key={post.id} {...rowPresence}>
                    <td>
                      <Link
                        to="/admin/posts/$id/edit"
                        params={{ id: String(post.id) }}
                        className="font-semibold hover:underline underline-offset-4"
                      >
                        {post.title}
                      </Link>
                      <div className="mt-1 text-sm text-text-secondary">
                        /{post.slug}
                      </div>
                    </td>
                    <td>
                      <ContentStatusBadge status={post.status} />
                    </td>
                    <td className="whitespace-nowrap">
                      {formatPostDate(post.createdAt)}
                    </td>
                    <td>
                      <RowActions>
                        <RowAction asChild label={'Edit ' + post.title}>
                          <Link
                            to="/admin/posts/$id/edit"
                            params={{ id: String(post.id) }}
                          >
                            <Pencil size={16} aria-hidden="true" />
                          </Link>
                        </RowAction>
                        <DeleteAction
                          label={'Delete ' + post.title}
                          pending={deleteMutation.isPending}
                          onConfirm={() => deleteMutation.mutate(post.id)}
                        />
                      </RowActions>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </Table>
        </TableScroll>
      )}
    </div>
  )
}
