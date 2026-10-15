import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import { experiencePoints } from '../src/components/resume/experience-points'

test('a title abbreviation stays inside its experience point', () => {
  assert.deepEqual(
    experiencePoints(
      'Led the team. Previously as Mobile Sr. Associate: maintained the app.',
    ),
    [
      'Led the team.',
      'Previously as Mobile Sr. Associate: maintained the app.',
    ],
  )
})

test('selected worktable role exposes every experience point', async () => {
  const server = await createServer({
    configFile: false,
    resolve: { alias: { '@': new URL('../src', import.meta.url).pathname } },
    server: { middlewareMode: true },
    appType: 'custom',
  })
  try {
    const { ResumeWorktable } = await server.ssrLoadModule(
      '/src/components/resume/ResumeWorktable.tsx',
    )
    const html = renderToStaticMarkup(
      createElement(ResumeWorktable, {
        experience: [
          {
            id: 1,
            title: 'Mobile Engineer',
            organization: 'Majoo Teknologi Indonesia',
            startDate: '2022-04-01',
            endDate: '2025-02-28',
            description:
              'Built the checkout flow. Improved app startup time. Led a five-person redesign.',
          },
        ],
      }),
    )

    assert.match(html, /Built the checkout flow/)
    assert.match(html, /Improved app startup time/)
    assert.match(html, /Led a five-person redesign/)
  } finally {
    await server.close()
  }
})
