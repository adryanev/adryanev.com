import assert from 'node:assert/strict'
import { test } from 'node:test'
import { blogListPath, parsePage } from '../src/lib/blog-paths'
import { formatPostDate, shouldShowUpdated } from '../src/lib/post-dates'
import { absoluteUrl, imageMimeType, SITE_URL, seoMeta } from '../src/lib/seo'

const PUBLISHED = new Date('2026-03-10T12:00:00Z')
const hoursAfter = (hours: number) =>
  new Date(PUBLISHED.getTime() + hours * 60 * 60 * 1000)

test('updated date shows only when the edit is more than a day after publishing', () => {
  assert.equal(shouldShowUpdated(PUBLISHED, hoursAfter(0)), false)
  assert.equal(shouldShowUpdated(PUBLISHED, hoursAfter(24)), false)
  assert.equal(shouldShowUpdated(PUBLISHED, hoursAfter(24.01)), true)
  assert.equal(shouldShowUpdated(PUBLISHED, hoursAfter(24 * 30)), true)
})

test('updated date is hidden for unpublished or missing dates and for clock skew', () => {
  assert.equal(shouldShowUpdated(null, hoursAfter(100)), false)
  assert.equal(shouldShowUpdated(PUBLISHED, undefined), false)
  assert.equal(shouldShowUpdated(PUBLISHED, hoursAfter(-100)), false)
})

test('post dates are formatted in UTC', () => {
  assert.equal(formatPostDate(new Date('2026-03-10T23:30:00Z')), 'March 10, 2026')
})

test('page parsing keeps only whole numbers above 1', () => {
  assert.equal(parsePage('3'), 3)
  assert.equal(parsePage(2), 2)
  assert.equal(parsePage('1'), undefined)
  assert.equal(parsePage('0'), undefined)
  assert.equal(parsePage('-4'), undefined)
  assert.equal(parsePage('2.5'), undefined)
  assert.equal(parsePage('abc'), undefined)
  assert.equal(parsePage(undefined), undefined)
})

test('list paths point at the tag page and carry the page number past page one', () => {
  assert.equal(blogListPath(undefined, 1), '/blog')
  assert.equal(blogListPath(undefined, 3), '/blog?page=3')
  assert.equal(blogListPath('cloudflare', 1), '/blog/tag/cloudflare')
  assert.equal(blogListPath('cloudflare', 2), '/blog/tag/cloudflare?page=2')
})

test('relative media paths become absolute and absolute URLs are untouched', () => {
  assert.equal(absoluteUrl('/media/cover.webp'), `${SITE_URL}/media/cover.webp`)
  assert.equal(
    absoluteUrl('https://cdn.example.com/a.png'),
    'https://cdn.example.com/a.png',
  )
  assert.equal(absoluteUrl('//cdn.example.com/a.png'), '//cdn.example.com/a.png')
})

test('image MIME type comes from the extension, ignoring the query string', () => {
  assert.equal(imageMimeType('https://x.test/a.JPG?v=2'), 'image/jpeg')
  assert.equal(imageMimeType('/media/a.webp'), 'image/webp')
  assert.equal(imageMimeType('/media/no-extension'), undefined)
})

function metaValue(meta: Array<Record<string, string>>, key: string) {
  return meta.find((entry) => entry.property === key || entry.name === key)
    ?.content
}

test('a page without an image falls back to the default share image', () => {
  const meta = seoMeta({ title: 'Blog', path: '/blog' })
  assert.equal(metaValue(meta, 'og:image'), `${SITE_URL}/images/og-default.png`)
  assert.equal(metaValue(meta, 'twitter:image'), `${SITE_URL}/images/og-default.png`)
  assert.equal(metaValue(meta, 'og:image:width'), '1200')
  assert.equal(metaValue(meta, 'og:image:height'), '630')
  assert.equal(metaValue(meta, 'twitter:card'), 'summary_large_image')
})

test('a relative cover image is emitted as an absolute URL without default dimensions', () => {
  const meta = seoMeta({ title: 'Post', path: '/blog/post', image: '/media/cover.webp' })
  assert.equal(metaValue(meta, 'og:image'), `${SITE_URL}/media/cover.webp`)
  assert.equal(metaValue(meta, 'og:image:alt'), 'Post')
  assert.equal(metaValue(meta, 'og:image:width'), undefined)
  assert.equal(metaValue(meta, 'twitter:card'), 'summary_large_image')
})
