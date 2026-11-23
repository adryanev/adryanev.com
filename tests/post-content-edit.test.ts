import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isContentEdit } from '../src/lib/post-dates'

const savedContent = JSON.stringify({
  time: 1700000000000,
  version: '2.31.5',
  blocks: [{ id: 'a1', type: 'paragraph', data: { text: 'Hello' } }],
})

const saved = { title: 'Title', excerpt: 'Summary', content: savedContent }

test('re-saving the same post is not a content edit', () => {
  const resaved = JSON.stringify({
    time: 1800000000000,
    version: '2.31.5',
    blocks: [{ id: 'b2', type: 'paragraph', data: { text: 'Hello' } }],
  })
  assert.equal(isContentEdit(saved, { ...saved, content: resaved }), false)
})

test('changing the title, excerpt, or body is a content edit', () => {
  assert.equal(isContentEdit(saved, { ...saved, title: 'New title' }), true)
  assert.equal(isContentEdit(saved, { ...saved, excerpt: 'New summary' }), true)
  const edited = JSON.stringify({
    time: 1700000000000,
    blocks: [{ id: 'a1', type: 'paragraph', data: { text: 'Hello, world' } }],
  })
  assert.equal(isContentEdit(saved, { ...saved, content: edited }), true)
})

test('an excerpt cleared to null and back to empty is not a content edit', () => {
  assert.equal(
    isContentEdit({ ...saved, excerpt: null }, { ...saved, excerpt: '' }),
    false,
  )
})
