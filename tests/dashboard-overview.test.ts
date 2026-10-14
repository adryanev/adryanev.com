import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import { createRouter, createRootRoute, createMemoryHistory, RouterProvider } from '@tanstack/react-router'

test('dashboard keeps real tasks and article readership available with and without content', async () => {
  const server = await createServer({ configFile: false, resolve: { alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) } }, cacheDir: '.impeccable/test-cache/dashboard', server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true } })
  try {
    const { DashboardOverview, DashboardPending } = await server.ssrLoadModule('/src/components/admin/DashboardOverview.tsx')
    const render = async (data: object) => {
      const routeTree = createRootRoute({ component: () => createElement(DashboardOverview, data) })
      const router = createRouter({ routeTree, history: createMemoryHistory({ initialEntries: ['/admin'] }) })
      await router.load()
      return renderToStaticMarkup(createElement(RouterProvider, { router }))
    }
    const data = {
      stats: { totalPosts: 8, totalProjects: 12, totalProducts: 2, draftPosts: 1, unreadContacts: 1, latestDraft: { id: 42, title: 'Draft <notes> & decisions' } },
      analytics: { recentViews: 12345, totalViews: 98765, popularPosts: [{ postId: 7, title: 'A very long published article title that must remain readable instead of being truncated', slug: 'long-published-article', views: 80 }] },
      subscriberStats: { total: 14, confirmed: 11, pending: 3 },
    }
    const populated = await render(data)
    assert.match(populated, /href="\/admin\/posts\/42\/edit"/)
    assert.match(populated, /Draft &lt;notes&gt; &amp; decisions/)
    assert.match(populated, /1 draft to continue/)
    assert.match(populated, /1 unread message/)
    assert.match(populated, /12,345/)
    assert.match(populated, /3 awaiting confirmation/)
    assert.match(populated, /href="\/blog\/long-published-article"/)
    assert.ok(populated.includes(data.analytics.popularPosts[0].title))
    assert.doesNotMatch(populated, /unique visitors|growth|%|<canvas/)

    const empty = await render({ stats: { totalPosts: 0, totalProjects: 0, totalProducts: 0, draftPosts: 0, unreadContacts: 0, latestDraft: null }, analytics: { recentViews: 0, totalViews: 0, popularPosts: [] }, subscriberStats: { total: 0, confirmed: 0, pending: 0 } })
    for (const copy of ['No drafts to continue', 'Inbox up to date', 'No article views yet.', 'Manage articles', 'Confirmed subscribers']) assert.ok(empty.includes(copy), copy)
    assert.match(empty, /href="\/admin\/posts\/new"/)
    assert.doesNotMatch(empty, /undefined|NaN|\/posts\/42\/edit|awaiting confirmation/)

    const plural = await render({ ...data, stats: { ...data.stats, draftPosts: 2, unreadContacts: 3 } })
    assert.match(plural, /2 drafts to continue/)
    assert.match(plural, /3 unread messages/)
    assert.match(renderToStaticMarkup(createElement(DashboardPending)), /role="status" aria-busy="true"/)
  } finally {
    await server.close()
  }
})
