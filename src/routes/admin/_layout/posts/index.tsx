import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Plus, Pencil, ExternalLink, FileText } from 'lucide-react'

import { getPosts, deletePost } from '@/server/functions/posts.functions'
import { formatPostDate } from '@/lib/post-dates'
import { groupPostsByMonth } from '@/lib/admin-groups'
import { FormError, Button } from '@/components/ui'
import { ContentStatusBadge } from '@/components/admin/ContentStatusBadge'
import { DeleteAction, RowAction, RowActions } from '@/components/admin/RowActions'
import {
  AdminBar,
  GroupHeaderRow,
  ListEmpty,
  ListFoot,
  useCollapsedGroups,
} from '@/components/admin/AdminList'

export const Route = createFileRoute('/admin/_layout/posts/')({
  loader: () => getPosts(),
  component: PostListPage,
})

const COLUMNS = 5

function PostListPage() {
  const posts = Route.useLoaderData()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState('')
  const groups = useCollapsedGroups()

  const deleteFn = useServerFn(deletePost)
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries()
      router.invalidate()
    },
  })

  const query = filter.trim().toLowerCase()
  const visibleGroups = useMemo(
    () =>
      groupPostsByMonth(
        posts.filter((post) => post.title.toLowerCase().includes(query)),
      ),
    [posts, query],
  )

  const newPost = (
    <Button asChild variant="primary" size="sm">
      <Link to="/admin/posts/new">
        <Plus size={16} aria-hidden="true" />
        New post
      </Link>
    </Button>
  )

  return (
    <section className="admin-screen">
      <AdminBar
        title="Posts"
        count={posts.length}
        filter={
          posts.length > 0
            ? { value: filter, onChange: setFilter, label: 'Filter posts by title' }
            : undefined
        }
      >
        {newPost}
      </AdminBar>
      <FormError
        message={
          deleteMutation.isError
            ? 'The post could not be removed. Try again.'
            : ''
        }
      />

      {posts.length === 0 ? (
        <ListEmpty icon={FileText} title="No posts yet" actions={newPost}>
          Your first published post shows up in the home page's writing list
          and the blog.
        </ListEmpty>
      ) : visibleGroups.length === 0 ? (
        <p className="admin-no-match">No posts match “{filter.trim()}”.</p>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th data-optional>Published</th>
                <th className="is-num" data-optional>Views</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            {visibleGroups.map((group) => {
              const open = groups.isOpen(group.key)
              return (
                <tbody key={group.key}>
                  <GroupHeaderRow
                    id={'posts-' + group.key}
                    label={group.label}
                    count={group.rows.length}
                    colSpan={COLUMNS}
                    open={open}
                    onToggle={() => groups.toggle(group.key)}
                  />
                  {open &&
                    group.rows.map((post) => (
                      <tr key={post.id}>
                        <td className="admin-table__title">
                          <Link
                            to="/admin/posts/$id/edit"
                            params={{ id: String(post.id) }}
                          >
                            {post.title}
                          </Link>
                        </td>
                        <td>
                          <ContentStatusBadge status={post.status} />
                        </td>
                        <td className="is-muted" data-optional>
                          {post.publishedAt ? formatPostDate(post.publishedAt) : '—'}
                        </td>
                        <td className="is-num" data-optional>{post.views}</td>
                        <td>
                          <RowActions>
                            <RowAction asChild label={'Edit ' + post.title}>
                              <Link
                                to="/admin/posts/$id/edit"
                                params={{ id: String(post.id) }}
                              >
                                <Pencil size={15} aria-hidden="true" />
                              </Link>
                            </RowAction>
                            {post.status === 'published' && (
                              <RowAction asChild label={'View ' + post.title + ' on the site'}>
                                <Link to="/blog/$slug" params={{ slug: post.slug }}>
                                  <ExternalLink size={15} aria-hidden="true" />
                                </Link>
                              </RowAction>
                            )}
                            <DeleteAction
                              label={'Delete ' + post.title}
                              pending={deleteMutation.isPending}
                              onConfirm={() => deleteMutation.mutate(post.id)}
                            />
                          </RowActions>
                        </td>
                      </tr>
                    ))}
                </tbody>
              )
            })}
          </table>
        </div>
      )}
      {posts.length > 0 && (
        <ListFoot>Grouped by publish month · drafts first</ListFoot>
      )}
    </section>
  )
}
