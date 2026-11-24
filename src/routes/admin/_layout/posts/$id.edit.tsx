import { createFileRoute } from '@tanstack/react-router'
import { PostForm } from '@/components/admin/PostForm'
import { getPostById } from '@/server/functions/posts.functions'

import { PageState } from '@/components/ui'

export const Route = createFileRoute('/admin/_layout/posts/$id/edit')({
  loader: ({ params }) => getPostById({ data: { id: Number(params.id) } }),
  component: EditPostPage,
})

function EditPostPage() {
  const post = Route.useLoaderData()

  if (!post) {
    return (
      <PageState>
        <h1>Post not found</h1>
        <p>Return to the collection to choose another entry.</p>
      </PageState>
    )
  }

  return (
    <PostForm
      key={post.id}
      initial={{
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt ?? '',
        coverImage: post.coverImage ?? '',
        status: post.status,
        tags: post.postsToTags.map((pt) => pt.tag.name),
        publishedAt: post.publishedAt,
        updatedAt: post.updatedAt,
      }}
    />
  )
}
