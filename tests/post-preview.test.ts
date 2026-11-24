import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  buildPostPreview,
  countWords,
  parsePostContent,
  type PostDraft,
  type SavedPost,
} from '../src/lib/post-preview'
import { resolvePostExcerpt, AUTO_EXCERPT_LENGTH } from '../src/lib/post-excerpt'

const now = new Date('2026-11-24T10:00:00Z')

const body = (...blocks: { type: string; data: Record<string, unknown> }[]) =>
  JSON.stringify({ time: 1, version: '2.31.5', blocks })

const draft = (overrides: Partial<PostDraft> = {}): PostDraft => ({
  title: 'Shipping a Worker',
  slug: '',
  content: body(
    { type: 'header', data: { text: 'Why', level: 2 } },
    { type: 'paragraph', data: { text: 'Because the <b>edge</b> is close.' } },
  ),
  excerpt: '',
  coverImage: '',
  tags: [],
  ...overrides,
})

test('an untouched editor previews an empty body', () => {
  for (const content of ['', '{not json', '{"time":1}']) {
    const preview = buildPostPreview(draft({ content }), null, now)
    assert.deepEqual(preview.content.blocks, [])
    assert.deepEqual(preview.headings, [])
    assert.equal(preview.excerpt, '')
    assert.equal(preview.readingTime, 1)
  }
})

test('words count the body text, not its markup', () => {
  assert.equal(countWords(parsePostContent(draft().content)), 6)
  assert.equal(countWords(parsePostContent('')), 0)
})

test('the body renders through the public heading anchors', () => {
  const preview = buildPostPreview(draft(), null, now)
  assert.deepEqual(preview.headings, [{ id: 'why', text: 'Why', level: 2 }])
  assert.equal(preview.content.blocks.length, 2)
})

test('an empty excerpt falls back to the opening of the body, as the save does', () => {
  const long = 'word '.repeat(80).trim()
  const content = body({ type: 'paragraph', data: { text: long } })
  const preview = buildPostPreview(draft({ content }), null, now)
  assert.equal(preview.excerpt, long.slice(0, AUTO_EXCERPT_LENGTH))
  assert.equal(preview.excerpt, resolvePostExcerpt(undefined, content))
  assert.equal(buildPostPreview(draft({ excerpt: 'Mine' }), null, now).excerpt, 'Mine')
})

test('the path follows the slug, or the title when the slug is blank', () => {
  assert.equal(buildPostPreview(draft(), null, now).path, '/blog/shipping-a-worker')
  assert.equal(buildPostPreview(draft({ slug: 'custom' }), null, now).path, '/blog/custom')
})

test('tags link by the slug the save path gives them', () => {
  const preview = buildPostPreview(draft({ tags: ['Cloudflare Workers', 'C++'] }), null, now)
  assert.deepEqual(preview.tags, [
    { name: 'Cloudflare Workers', slug: 'cloudflare-workers' },
    { name: 'C++', slug: 'c' },
  ])
})

test('a new post previews as published now', () => {
  const preview = buildPostPreview(draft({ coverImage: '' }), null, now)
  assert.equal(preview.publishedAt, now)
  assert.equal(preview.updatedAt, now)
  assert.equal(preview.coverImage, null)
})

test('a saved post keeps its dates until its content changes', () => {
  const current = draft({ excerpt: 'Summary' })
  const saved: SavedPost = {
    title: current.title,
    excerpt: 'Summary',
    content: current.content,
    publishedAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-02-01T00:00:00Z'),
  }

  const untouched = buildPostPreview(current, saved, now)
  assert.equal(untouched.publishedAt, saved.publishedAt)
  assert.equal(untouched.updatedAt, saved.updatedAt)

  const edited = buildPostPreview({ ...current, title: 'Shipping two Workers' }, saved, now)
  assert.equal(edited.publishedAt, saved.publishedAt)
  assert.equal(edited.updatedAt, now)
})

test('a saved draft previews as published now', () => {
  const current = draft()
  const saved: SavedPost = {
    title: current.title,
    excerpt: null,
    content: current.content,
    publishedAt: null,
    updatedAt: new Date('2026-02-01T00:00:00Z'),
  }
  assert.equal(buildPostPreview(current, saved, now).publishedAt, now)
})
