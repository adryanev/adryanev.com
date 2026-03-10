import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/resume')({
  component: ResumePage,
})

function ResumePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <h1 className="text-4xl font-bold">Resume</h1>
      <p className="mt-4 text-slate-600 dark:text-slate-400">Coming soon.</p>
    </div>
  )
}
