import { createFileRoute } from '@tanstack/react-router'
import { PostForm } from '@/components/admin/PostForm'

import { PageHeader } from '@/components/ui'
export const Route = createFileRoute('/admin/_layout/posts/new')({
  component: NewPostPage,
})

function NewPostPage() {
  return (
    <div>
      <PageHeader>
        <div>
          <h1 className="text-2xl font-bold">New Post</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Create a new blog post
          </p>
        </div>
      </PageHeader>
      <div className="mt-6">
        <PostForm />
      </div>
    </div>
  )
}
