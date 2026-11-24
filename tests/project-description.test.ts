import assert from 'node:assert/strict'
import { test } from 'node:test'
import { projectSummary, renderProjectStory } from '../src/lib/editorjs-renderer.ts'

const editorJs = (...blocks: { type: string; data: Record<string, unknown> }[]) => JSON.stringify({ blocks })

test('legacy project notes retain paragraphs and escape HTML as text', async () => {
  assert.deepEqual(await renderProjectStory('  First & second\nnext line\n\n<script>alert("test")</script>  '), {
    ledeHtml: 'First &amp; second<br />next line',
    bodyHtml: '<p>&lt;script&gt;alert(&quot;test&quot;)&lt;/script&gt;</p>',
  })
  assert.deepEqual(await renderProjectStory('  \n '), { ledeHtml: '', bodyHtml: '' })
  for (const text of ['2026', 'true', 'null']) assert.deepEqual(await renderProjectStory(text), { ledeHtml: text, bodyHtml: '' })
})

test('the first sentence becomes the lede and the rest of its paragraph opens the body', async () => {
  assert.deepEqual(await renderProjectStory('Resolves 8.9M events. It reaches 93.5% precision. Done.\n\nSecond paragraph.'), {
    ledeHtml: 'Resolves 8.9M events.',
    bodyHtml: '<p>It reaches 93.5% precision. Done.</p>\n<p>Second paragraph.</p>',
  })
})

test('EditorJS ledes never split inside inline formatting', async () => {
  assert.deepEqual(await renderProjectStory(editorJs({ type: 'paragraph', data: { text: 'A <b>real. Bold</b> claim. Then <i>more</i>.' } })), {
    ledeHtml: 'A <b>real. Bold</b> claim.',
    bodyHtml: '<p>Then <i>more</i>.</p>',
  })
  assert.deepEqual(await renderProjectStory(editorJs({ type: 'paragraph', data: { text: 'A <b>real</b> contribution' } })), {
    ledeHtml: 'A <b>real</b> contribution',
    bodyHtml: '',
  })
})

test('a description that opens with a non-paragraph block has no lede', async () => {
  const story = await renderProjectStory(editorJs({ type: 'header', data: { text: 'Scope', level: 2 } }, { type: 'paragraph', data: { text: 'Body. More.' } }))
  assert.equal(story.ledeHtml, '')
  assert.equal(story.bodyHtml, '<h2>Scope</h2>\n<p>Body. More.</p>')
  assert.equal(projectSummary(editorJs({ type: 'header', data: { text: 'Scope', level: 2 } })), '')
})

test('rendering failures surface', async () => {
  await assert.rejects(renderProjectStory(JSON.stringify({ blocks: null })))
})

test('the summary is the first sentence as plain text', () => {
  assert.equal(projectSummary('Tom & Jerry ship apps. They sell well.'), 'Tom & Jerry ship apps.')
  assert.equal(projectSummary(editorJs({ type: 'paragraph', data: { text: 'A <a href="/x">linked</a> app. More.' } })), 'A linked app.')
  assert.equal(projectSummary(''), '')
})
