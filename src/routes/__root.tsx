import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useRouterState,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import '../app.css'

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Adryan Eka Vandra — Software Engineer' },
      {
        name: 'description',
        content:
          'Personal website of Adryan Eka Vandra — Software Engineer. Portfolio, blog, resume, and active SaaS projects.',
      },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap',
      },
      {
        rel: 'alternate',
        type: 'application/rss+xml',
        title: 'Adryan Eka Vandra — Blog',
        href: '/feed.xml',
      },
    ],
    scripts: [
      {
        children: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
      },
    ],
  }),
})

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <p className="font-mono text-6xl font-bold text-accent">404</p>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          Page not found
        </p>
        <p className="mt-2 font-mono text-sm text-slate-500 dark:text-slate-500">
          $ cat page.md → error: no such file
        </p>
        <a
          href="/"
          className="mt-6 inline-block rounded-md bg-accent px-4 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-accent-hover"
        >
          Go home
        </a>
      </div>
    </div>
  )
}

function RootComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isAdmin = pathname.startsWith('/admin')

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body
        className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100"
        suppressHydrationWarning
      >
        {isAdmin ? (
          <Outlet />
        ) : (
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              <Outlet />
            </main>
            <Footer />
          </div>
        )}
        {import.meta.env.DEV && <TanStackRouterDevtools />}
        <Scripts />
      </body>
    </html>
  )
}
