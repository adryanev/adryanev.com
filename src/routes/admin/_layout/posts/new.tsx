import { createFileRoute } from '@tanstack/react-router'
import { PostForm } from '@/components/admin/PostForm'

export const Route = createFileRoute('/admin/_layout/posts/new')({
  component: NewPostPage,
})

function NewPostPage() {
  return <PostForm />
}
