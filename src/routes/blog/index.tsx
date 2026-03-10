import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/blog/')({
  component: BlogPage,
})

function BlogPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <h1 className="text-4xl font-bold">Blog</h1>
      <p className="mt-4 text-slate-600 dark:text-slate-400">Coming soon.</p>
    </div>
  )
}
