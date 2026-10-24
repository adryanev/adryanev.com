import assert from 'node:assert/strict'
import { test } from 'node:test'
import { renderEditorJs } from '../src/lib/editorjs-renderer.ts'

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
