import { createFileRoute } from '@tanstack/react-router'
import { PostForm } from '@/components/admin/PostForm'
import { getPostById } from '@/server/functions/posts.functions'

export const Route = createFileRoute('/admin/_layout/posts/$id/edit')({
  loader: ({ params }) => getPostById({ data: { id: Number(params.id) } }),
  component: EditPostPage,
})

function EditPostPage() {
  const post = Route.useLoaderData()

  if (!post) {
    return (
      <div className="py-12 text-center text-slate-500">Post not found</div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Edit Post</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Editing: {post.title}
      </p>
      <div className="mt-6">
        <PostForm
          initial={{
            id: post.id,
            title: post.title,
            slug: post.slug,
            content: post.content,
            excerpt: post.excerpt ?? '',
            coverImage: post.coverImage ?? '',
            status: post.status,
            tags: post.postsToTags.map((pt) => pt.tag.name),
          }}
        />
      </div>
    </div>
  )
}
