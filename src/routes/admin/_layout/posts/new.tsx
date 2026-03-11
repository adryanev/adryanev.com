import { createFileRoute } from '@tanstack/react-router'
import { PostForm } from '@/components/admin/PostForm'

export const Route = createFileRoute('/admin/_layout/posts/new')({
  component: NewPostPage,
})

function NewPostPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">New Post</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Create a new blog post
      </p>
      <div className="mt-6">
        <PostForm />
      </div>
    </div>
  )
}
