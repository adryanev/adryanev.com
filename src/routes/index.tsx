import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="flex flex-col items-center text-center">
        <p className="font-mono text-sm text-accent">Hello, world! I'm</p>
        <h1 className="mt-4 text-5xl font-bold tracking-tight sm:text-6xl">
          Adryan Eka Vandra
        </h1>
        <p className="mt-4 max-w-xl text-lg text-slate-600 dark:text-slate-400">
          Software Engineer building things for the web.
        </p>
        <div className="mt-8 font-mono text-sm text-slate-500 dark:text-slate-500">
          <span className="text-accent">$</span> site --status
          <br />
          <span className="text-slate-400 dark:text-slate-600">
            {'>'} Under construction. Check back soon.
          </span>
        </div>
      </div>
    </div>
  )
}
