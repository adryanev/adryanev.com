import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import { createRouter, createRootRoute, createMemoryHistory, RouterProvider } from '@tanstack/react-router'

test('dossier server-renders notes, an open ledger, optional evidence links and ordered images', async () => {
  const server = await createServer({ configFile: false, resolve: { alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) } }, cacheDir: '.impeccable/test-cache/project-dossier', server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true } })
  try {
    const { ProjectDossier } = await server.ssrLoadModule('/src/components/work/ProjectDossier.tsx')
    const project = {
      title: 'Checkout', role: 'Mobile Engineer', year: 2025, workplace: 'Example company',
      technology: ['Kotlin', 'SQLite'], descriptionHtml: '<p>Built the checkout flow.</p>',
      externalUrl: 'https://example.com/app', githubUrl: 'https://github.com/example',
      category: { name: 'Work', slug: 'work' },
      images: [{ id: 2, url: '/second.png', alt: 'First supplied image' }, { id: 1, url: '/first.png', alt: null }],
    }
    const render = async (data: typeof project) => {
      const routeTree = createRootRoute({ component: () => createElement(ProjectDossier, { project: data }) })
      const router = createRouter({ routeTree, history: createMemoryHistory({ initialEntries: ['/'] }) })
      await router.load()
      return renderToStaticMarkup(createElement(RouterProvider, { router }))
    }
    const html = await render(project)
    for (const text of ['Built the checkout flow.', '2025', 'Mobile Engineer', 'Example company', 'Kotlin', 'SQLite']) assert.ok(html.includes(text), text)
    assert.ok(html.indexOf('Project notes') < html.indexOf('<aside'))
    assert.ok(html.indexOf('</aside>') < html.indexOf('Project images'))
    assert.ok(html.indexOf('/second.png') < html.indexOf('/first.png'))
    assert.match(html, /href="\/portfolio\/work"/)
    assert.match(html, /Open project/)
    assert.match(html, /GitHub/)
    assert.match(html, /rel="noopener noreferrer"/)
    assert.match(html, /<figcaption>First supplied image<\/figcaption>/)
    assert.match(html, /alt="Checkout, project image 2"/)
    assert.doesNotMatch(html, /<details|canvas/)

    const empty = await render({ ...project, technology: [], descriptionHtml: '', externalUrl: null, githubUrl: null, images: [] })
    assert.match(empty, /Project notes are currently unavailable/)
    assert.match(empty, /No technology details listed/)
    assert.doesNotMatch(empty, /Project images|Open project|>GitHub/)
  } finally {
    await server.close()
  }
})
