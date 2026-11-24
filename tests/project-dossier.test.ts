import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import { createRouter, createRootRoute, createMemoryHistory, RouterProvider } from '@tanstack/react-router'

test('dossier server-renders the story, metrics, links, ordered images and the next project', async () => {
  const server = await createServer({ configFile: false, resolve: { alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) } }, cacheDir: '.impeccable/test-cache/project-dossier', server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true } })
  try {
    const { ProjectDossier } = await server.ssrLoadModule('/src/components/work/ProjectDossier.tsx')
    const project = {
      title: 'Checkout', role: 'Mobile Engineer', year: 2025, workplace: 'Example company',
      technology: ['Kotlin', 'SQLite'],
      ledeHtml: 'Rebuilt the checkout.', descriptionHtml: '<p>Built the checkout flow.</p>',
      metrics: [{ value: '3×', label: 'orders per week' }], metricsNote: 'Measured over one quarter.',
      externalUrl: 'https://example.com/app', githubUrl: 'https://github.com/example',
      category: { name: 'Work', slug: 'work' },
      images: [{ id: 2, url: '/second.png', alt: 'First supplied image' }, { id: 1, url: '/first.png', alt: null }],
      nextProject: { slug: 'ledger', title: 'Ledger', role: 'Backend Engineer', year: 2024 },
    }
    const render = async (data: typeof project) => {
      const routeTree = createRootRoute({ component: () => createElement(ProjectDossier, { project: data }) })
      const router = createRouter({ routeTree, history: createMemoryHistory({ initialEntries: ['/'] }) })
      await router.load()
      return renderToStaticMarkup(createElement(RouterProvider, { router }))
    }
    const html = await render(project)
    for (const text of ['Rebuilt the checkout.', 'Built the checkout flow.', '2025', 'Mobile Engineer', 'Example company', 'Kotlin', 'SQLite', '3×', 'orders per week', 'Measured over one quarter.']) assert.ok(html.includes(text), text)
    assert.ok(html.indexOf('Rebuilt the checkout.') < html.indexOf('3×'))
    assert.ok(html.indexOf('3×') < html.indexOf('Built the checkout flow.'))
    assert.ok(html.indexOf('/second.png') < html.indexOf('/first.png'))
    assert.match(html, /href="\/portfolio\/work"/)
    assert.match(html, /Open project/)
    assert.match(html, /GitHub/)
    assert.match(html, /rel="noopener noreferrer"/)
    assert.match(html, /<figcaption>First supplied image<\/figcaption>/)
    assert.match(html, /alt="Checkout, project image 2"/)
    assert.match(html, /href="\/portfolio\/work\/ledger"[^>]*>.*Next in Work.*Ledger.*Backend Engineer · 2024/)
    assert.doesNotMatch(html, /data-solo/)

    const empty = await render({ ...project, technology: [], ledeHtml: '', descriptionHtml: '', metrics: [], metricsNote: 'Orphan note', externalUrl: null, githubUrl: null, images: [], nextProject: null })
    assert.match(empty, /Project notes are currently unavailable/)
    assert.match(empty, /data-solo/)
    assert.match(empty, /Last project in Work/)
    assert.match(empty, /Back to Work/)
    assert.doesNotMatch(empty, /Orphan note|<figure|Open project|>GitHub/)
  } finally {
    await server.close()
  }
})
