import assert from 'node:assert/strict'
import { test } from 'node:test'
import { renderEditorJs, renderEditorJsWithHeadings } from '../src/lib/editorjs-renderer.ts'

const codeBlock = (code: string, language?: string) => ({
  blocks: [{ type: 'code', data: { code, language } }],
})

test('code blocks in a highlighted language are marked for the browser highlighter', async () => {
  const html = await renderEditorJs(codeBlock('const a = 1 < 2', 'typescript'))

  assert.equal(
    html,
    '<pre data-code-language="typescript"><code>const a = 1 &lt; 2</code></pre>',
  )
})

test('code blocks in other languages render as escaped plain code', async () => {
  assert.equal(
    await renderEditorJs(codeBlock('<b>x</b>', 'cobol')),
    '<pre><code>&lt;b&gt;x&lt;/b&gt;</code></pre>',
  )
  assert.equal(
    await renderEditorJs(codeBlock('echo hi')),
    '<pre><code>echo hi</code></pre>',
  )
})

test('a language value cannot inject attributes', async () => {
  const html = await renderEditorJs(codeBlock('x', 'ts" onmouseover="alert(1)'))

  assert.equal(html, '<pre><code>x</code></pre>')
})

const header = (text: string, level = 2) => ({ type: 'header', data: { text, level } })

test('headings render without ids unless anchors are requested', async () => {
  assert.equal(
    await renderEditorJs({ blocks: [header('Setup')] }),
    '<h2>Setup</h2>',
  )
})

test('headings get a slug id and a labelled hover anchor', async () => {
  const html = await renderEditorJs({ blocks: [header('Getting Started')] }, { headingAnchors: true })

  assert.equal(
    html,
    '<h2 id="getting-started">Getting Started<a class="heading-anchor" href="#getting-started" aria-label="Link to section: Getting Started">#</a></h2>',
  )
})

test('repeated heading text gets numbered ids within a post', async () => {
  const { headings } = await renderEditorJsWithHeadings(
    { blocks: [header('Notes'), header('Notes', 3), header('Notes'), header('Notes 2')] },
    { headingAnchors: true },
  )

  assert.deepEqual(headings.map((h) => h.id), ['notes', 'notes-2', 'notes-3', 'notes-2-2'])
})

test('heading ids and text come from the plain text of inline html', async () => {
  const { html, headings } = await renderEditorJsWithHeadings(
    { blocks: [header('Using <code>fetch</code> &amp; <b>cache</b>')] },
    { headingAnchors: true },
  )

  assert.deepEqual(headings, [{ id: 'using-fetch-cache', text: 'Using fetch & cache', level: 2 }])
  assert.match(html, /<h2 id="using-fetch-cache">Using <code>fetch<\/code> &amp; <b>cache<\/b><a /)
  assert.match(html, /aria-label="Link to section: Using fetch &amp; cache"/)
})

test('a heading with no slug characters gets a fallback id', async () => {
  const { headings } = await renderEditorJsWithHeadings(
    { blocks: [header('日本語'), header('???')] },
    { headingAnchors: true },
  )

  assert.deepEqual(headings.map((h) => h.id), ['section', 'section-2'])
})

test('heading text cannot break out of the anchor label', async () => {
  const html = await renderEditorJs({ blocks: [header('Say "hi" <script>x</script>')] }, { headingAnchors: true })

  assert.doesNotMatch(html, /<script/)
  assert.match(html, /aria-label="Link to section: Say &quot;hi&quot; x"/)
})
