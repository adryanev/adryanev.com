import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server'
import { createServerEntry } from '@tanstack/react-start/server-entry'
import { generateRssFeed } from '@/lib/feed'
import { generateSitemap, generateRobotsTxt } from '@/lib/sitemap'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

if (process.env.NODE_ENV === 'production') {
  SECURITY_HEADERS['Strict-Transport-Security'] =
    'max-age=31536000; includeSubDomains'
}

const handler = createStartHandler(defaultStreamHandler)

// SEO endpoints that return non-HTML responses
async function handleSeoEndpoints(request: Request): Promise<Response | null> {
  const url = new URL(request.url)

  if (url.pathname === '/feed.xml') {
    const xml = await generateRssFeed()
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  }

  if (url.pathname === '/sitemap.xml') {
    const xml = await generateSitemap()
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  }

  if (url.pathname === '/robots.txt') {
    return new Response(generateRobotsTxt(), {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  }

  if (url.pathname === '/health') {
    try {
      await db.execute(sql`SELECT 1`)
      return new Response(JSON.stringify({ status: 'ok', db: 'connected' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    } catch {
      return new Response(
        JSON.stringify({ status: 'error', db: 'disconnected' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } },
      )
    }
  }

  return null
}

const secureHandler: typeof handler = async (request) => {
  // Check SEO endpoints first
  const seoResponse = await handleSeoEndpoints(request)
  if (seoResponse) {
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      seoResponse.headers.set(key, value)
    }
    return seoResponse
  }

  const response = await handler(request)
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value)
  }
  return response
}

const fetch = secureHandler

export default createServerEntry({
  fetch,
})
