import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'

test('slotted controls have a single element child in every migrated consumer', () => {
  const root = fileURLToPath(new URL('../src', import.meta.url))
  const visitDirectory = (directory: string) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name)
      if (entry.isDirectory()) {
        visitDirectory(path)
        continue
      }
      if (!path.endsWith('.tsx')) continue
      const source = ts.createSourceFile(
        path,
        readFileSync(path, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      )
      const visit = (node: ts.Node) => {
        if (
          ts.isJsxElement(node) &&
          ['Button', 'Panel'].includes(
            node.openingElement.tagName.getText(source),
          ) &&
          node.openingElement.attributes.properties.some(
            (attribute) =>
              ts.isJsxAttribute(attribute) &&
              attribute.name.getText(source) === 'asChild',
          )
        ) {
          const children = node.children.filter(
            (child) => !(ts.isJsxText(child) && !child.text.trim()),
          )
          const line =
            source.getLineAndCharacterOfPosition(node.getStart()).line + 1
          assert.equal(
            children.length,
            1,
            `${path}:${line} must pass one child to Radix Slot`,
          )
          assert.ok(
            ts.isJsxElement(children[0]) ||
              ts.isJsxSelfClosingElement(children[0]),
            `${path}:${line} must pass an element to Radix Slot`,
          )
        }
        ts.forEachChild(node, visit)
      }
      visit(source)
    }
  }
  visitDirectory(root)
})

test('shared controls preserve native semantics and connect accessible field feedback', async () => {
  const server = await createServer({
    configFile: false,
    resolve: {
      alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) },
    },
    cacheDir: '.impeccable/test-cache/design-system',
    server: { middlewareMode: true, hmr: false },
    appType: 'custom',
    optimizeDeps: { noDiscovery: true },
  })
  try {
    const {
      Button,
      Field,
      Input,
      Select,
      Textarea,
      Panel,
      Feedback,
      Table,
      TableScroll,
    } = await server.ssrLoadModule('/src/components/ui/index.ts')
    const render = (node: ReturnType<typeof h>) => renderToStaticMarkup(node)
    assert.match(render(h(Button, null, 'Cancel')), /type="button"/)
    assert.match(
      render(h(Button, { type: 'submit', pending: true }, 'Saving…')),
      /aria-busy="true"/,
    )
    assert.match(render(h(Button, { pending: true }, 'Saving…')), /disabled=""/)
    const link = render(
      h(
        Button,
        { asChild: true, disabled: true },
        h('a', { href: '/resume', download: true }, 'Download'),
      ),
    )
    assert.match(link, /^<a /)
    assert.match(link, /href="\/resume"/)
    assert.match(link, /download=""/)
    assert.match(link, /aria-disabled="true"/)
    assert.match(link, /tabindex="-1"/)
    assert.doesNotMatch(link, /<button|type="button"| disabled=/)

    for (const Control of [Input, Select, Textarea]) {
      const hint = render(
        h(
          Field,
          { label: 'Title', htmlFor: 'title', hint: 'Shown publicly.' },
          h(Control, { defaultValue: '' }),
        ),
      )
      assert.match(hint, /<label id="title-label" for="title"/)
      assert.match(hint, /id="title"/)
      assert.match(hint, /aria-describedby="title-description"/)
      assert.match(hint, /<p id="title-description"/)
      const invalid = render(
        h(
          Field,
          {
            label: 'Title',
            htmlFor: 'title',
            hint: 'Shown publicly.',
            error: 'A title is required.',
          },
          h(Control),
        ),
      )
      assert.match(invalid, /aria-invalid="true"/)
      assert.match(invalid, /id="title-description" role="alert"/)
      assert.doesNotMatch(invalid, /Shown publicly/)
    }
    const choices = render(
      h(Field, { label: 'Events', htmlFor: 'events' }, [
        h(Input, { key: 'a', type: 'checkbox' }),
        h(Input, { key: 'b', type: 'checkbox' }),
      ]),
    )
    assert.doesNotMatch(choices, /<input[^>]*id="events"/)
    const labelled = render(
      h(
        Field,
        { label: 'Notes', htmlFor: 'notes', hint: 'Context' },
        h(Input, { 'aria-describedby': 'custom-note' }),
      ),
    )
    assert.match(labelled, /aria-describedby="custom-note"/)

    const panel = render(
      h(
        Panel,
        { asChild: true },
        h('section', { 'aria-label': 'Subscription' }, 'Content'),
      ),
    )
    assert.match(panel, /^<section aria-label="Subscription"/)
    assert.match(
      render(h(Feedback, { tone: 'danger' }, 'Failed')),
      /role="alert"/,
    )
    assert.match(
      render(h(Feedback, { tone: 'success' }, 'Saved')),
      /role="status"/,
    )
    const table = render(
      h(
        TableScroll,
        { 'aria-label': 'Content records' },
        h(
          Table,
          null,
          h('caption', null, 'Published work'),
          h('tbody', null, h('tr', null, h('td', null, 'Entry'))),
        ),
      ),
    )
    assert.match(
      table,
      /aria-label="Content records" role="region" tabindex="0"/,
    )
    assert.match(table, /<table[^>]*><caption>Published work<\/caption><tbody>/)
  } finally {
    await server.close()
  }
})
