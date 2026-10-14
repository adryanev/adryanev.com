import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useRouterState,
} from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ThemeProvider } from '@/context/ThemeContext'
import { websiteJsonLd, personJsonLd, jsonLdScript } from '@/lib/seo'
import '../app.css'

import '@/components/layout/public-pages.css'
import { RouteError, RoutePending } from '@/components/layout/RouteState'
const CommandPalette = lazy(() =>
  import('@/components/command-palette/CommandPalette').then((mod) => ({
    default: mod.CommandPalette,
  })),
)

const TerminalOverlay = lazy(() =>
  import('@/components/terminal/TerminalOverlay').then((mod) => ({
    default: mod.TerminalOverlay,
  })),
)

const TanStackRouterDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-router-devtools').then((mod) => ({
        default: mod.TanStackRouterDevtools,
      })),
    )
  : () => null

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  pendingComponent: RoutePending,
  errorComponent: RouteError,
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#f8e9bd', media: '(prefers-color-scheme: light)' },
      { name: 'theme-color', content: '#111a1b', media: '(prefers-color-scheme: dark)' },
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
        href: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=DM+Mono:wght@400;500&display=swap',
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
      jsonLdScript([websiteJsonLd(), personJsonLd()]),
      ...(process.env.UMAMI_URL && process.env.UMAMI_WEBSITE_ID
        ? [
            {
              src: process.env.UMAMI_URL,
              'data-website-id': process.env.UMAMI_WEBSITE_ID,
              'data-domains': new URL(process.env.SITE_URL || 'https://adryanev.com').hostname,
              'data-do-not-track': 'true',
              defer: true,
            },
          ]
        : []),
    ],
  }),
})

function NotFoundComponent() {
  return <div className="route-state"><h1>Page not found</h1><p>This address does not lead to a page. Browse the project archive or return home.</p><div className="page-actions"><a className="page-button" href="/portfolio">Explore work</a><a className="page-button page-button--quiet" href="/">Back home</a></div></div>
}

function RootComponent() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const isAdmin = pathname.startsWith('/admin')
  return <html lang="en" suppressHydrationWarning>
    <head><HeadContent /></head>
    <body className="min-h-screen font-sans" suppressHydrationWarning>
      <ThemeProvider>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:bg-accent focus:text-accent-fg focus:px-4 focus:py-2">Skip to main content</a>
        {isAdmin ? <Outlet /> : <>
          <div className="public-site flex min-h-screen flex-col bg-bg-primary/95">
            <Header /><main id="main-content" className="flex-1 flex flex-col"><Outlet /></main><Footer />
          </div>
          <Suspense><CommandPalette /></Suspense><Suspense><TerminalOverlay /></Suspense>
        </>}
      </ThemeProvider>
      <Suspense><TanStackRouterDevtools /></Suspense><Scripts />
    </body>
  </html>
}
