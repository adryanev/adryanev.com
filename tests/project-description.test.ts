import assert from 'node:assert/strict'
import { test } from 'node:test'
import { renderProjectDescription } from '../src/lib/editorjs-renderer.ts'

test('legacy project notes retain paragraphs and escape HTML as text', async () => {
  const html = await renderProjectDescription('  First & second\nnext line\n\n<script>alert("test")</script>  ')
  assert.equal(html, '<p>First &amp; second<br />next line</p>\n<p>&lt;script&gt;alert(&quot;test&quot;)&lt;/script&gt;</p>')
  assert.equal(await renderProjectDescription('  \n '), '')
  for (const text of ['2026', 'true', 'null']) assert.equal(await renderProjectDescription(text), `<p>${text}</p>`)
})

test('EditorJS project notes retain rich text and surface rendering failures', async () => {
  assert.equal(await renderProjectDescription(JSON.stringify({ blocks: [{ type: 'paragraph', data: { text: 'A <b>real</b> contribution' } }] })), '<p>A <b>real</b> contribution</p>')
  await assert.rejects(renderProjectDescription(JSON.stringify({ blocks: null })))
})
