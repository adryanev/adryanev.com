import assert from 'node:assert/strict'
import { test } from 'node:test'
import { editorContent, editorContentSignature } from '../src/lib/editor-content'

test('legacy project notes stay editable without becoming raw markup', () => {
  const data = editorContent('Built the <checkout> & API.\nKept delivery working.\n\nSecond paragraph.')
  assert.deepEqual(data?.blocks, [
    { type: 'paragraph', data: { text: 'Built the &lt;checkout&gt; &amp; API.<br>Kept delivery working.' } },
    { type: 'paragraph', data: { text: 'Second paragraph.' } },
  ])
  assert.equal(editorContent('  '), null)
  assert.equal(editorContent('2026')?.blocks[0].data.text, '2026')
})

test('EditorJS blocks retain their types and data during editing', () => {
  const data = { blocks: [{ type: 'code', data: { code: 'const total = 1', language: 'typescript' } }] }
  assert.deepEqual(editorContent(JSON.stringify(data)), data)
})

test('editor metadata does not mark unchanged content dirty', () => {
  const original = { blocks: [{ type: 'header', data: { text: 'Notes', level: 2 } }] }
  const initialized = { time: 123, version: '2.31', blocks: [{ id: 'generated', type: 'header', data: { level: 2, text: 'Notes' }, tunes: {} }] }
  assert.equal(editorContentSignature(JSON.stringify(original)), editorContentSignature(JSON.stringify(initialized)))
  initialized.blocks[0].data.text = 'Changed notes'
  assert.notEqual(editorContentSignature(JSON.stringify(original)), editorContentSignature(JSON.stringify(initialized)))
})
