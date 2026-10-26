import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import {
  createRouter,
  createRootRoute,
  createMemoryHistory,
  RouterProvider,
} from '@tanstack/react-router'

test('Work server-renders project evidence and real case study links without WebGL', async () => {
  const server = await createServer({
    configFile: false,
    resolve: { alias: { '@': new URL('../src', import.meta.url).pathname } },
    cacheDir: '.impeccable/test-cache/work-index',
    server: { middlewareMode: true, hmr: false },
    appType: 'custom',
    optimizeDeps: { noDiscovery: true },
  })
  try {
    const { WorkIndex } = await server.ssrLoadModule(
      '/src/components/work/WorkIndex.tsx',
    )
    const categories = [
      {
        id: 1,
        name: 'Work',
        slug: 'work',
        description: 'Engineering work',
        projects: [
          {
            id: 1,
            title: 'Checkout',
            slug: 'checkout',
            year: 2025,
            role: 'Mobile Engineer',
            workplace: 'Example company',
            technology: ['Kotlin', 'SQLite'],
          },
        ],
      },
    ]
    const render = async (data: typeof categories) => {
      const routeTree = createRootRoute({
        component: () => createElement(WorkIndex, { categories: data }),
      })
      const router = createRouter({
        routeTree,
        history: createMemoryHistory({ initialEntries: ['/'] }),
      })
      await router.load()
      return renderToStaticMarkup(createElement(RouterProvider, { router }))
    }
    const html = await render(categories)
    assert.match(html, /href="\/portfolio\/work\/checkout"/)
    for (const evidence of [
      'Checkout',
      '2025',
      'Mobile Engineer',
      'Example company',
      'Kotlin',
      'SQLite',
    ])
      assert.ok(html.includes(evidence), evidence)
    assert.match(html, /aria-pressed="true"/)
    assert.match(html, /work-archive-poster\.webp/)
    const empty = await render([])
    assert.match(empty, /No projects yet/)
    assert.doesNotMatch(empty, /work-ledger__row/)
  } finally {
    await server.close()
  }
})
