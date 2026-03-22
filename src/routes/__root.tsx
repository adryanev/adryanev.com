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
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#f4f0eb', media: '(prefers-color-scheme: light)' },
      { name: 'theme-color', content: '#0a0a0a', media: '(prefers-color-scheme: dark)' },
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
        href: 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap',
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
  return (
    <div className="flex min-h-[60vh] items-center justify-center border-b border-border">
      <div className="text-center p-12 brutal-border brutal-shadow bg-bg-primary dark:bg-bg-secondary">
        <p className="font-serif text-8xl font-bold text-accent italic">404</p>
        <p className="mt-4 font-serif text-2xl font-bold italic text-text-primary">
          Page Not Found
        </p>
        <p className="mt-4 font-sans text-sm text-text-secondary">
          The page you're looking for doesn't exist.
        </p>
        <a
          href="/"
          className="mt-8 inline-block brutal-border bg-accent px-8 py-3 text-sm font-bold uppercase tracking-wider text-accent-fg transition-colors hover:bg-text-primary hover:text-bg-primary"
        >
          Back to Home
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
        className="min-h-screen font-sans"
        suppressHydrationWarning
      >
        {/* Skip link for keyboard navigation */}
        {!isAdmin && (
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:bg-accent focus:text-accent-fg focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:font-bold"
          >
            Skip to main content
          </a>
        )}
        {isAdmin ? (
          <Outlet />
        ) : (
          <ThemeProvider>
            <div className="flex min-h-screen flex-col bg-bg-primary/95">
              <Header />
              <main id="main-content" className="flex-1 flex flex-col">
                <Outlet />
              </main>
              <Footer />
            </div>
            <Suspense>
              <CommandPalette />
            </Suspense>
            <Suspense>
              <TerminalOverlay />
            </Suspense>
          </ThemeProvider>
        )}
        <Suspense>
          <TanStackRouterDevtools />
        </Suspense>
        <Scripts />
      </body>
    </html>
  )
}
