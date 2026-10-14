import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getArticleViewWindow } from '../src/lib/view-window'

test('seven article-view dates include today and exclude the eighth date', () => {
  assert.deepEqual(getArticleViewWindow(new Date('2026-10-14T23:59:59Z')), { startDate: '2026-10-08', endDate: '2026-10-14' })
})

test('article-view dates follow UTC across year and leap-day boundaries', () => {
  assert.deepEqual(getArticleViewWindow(new Date('2026-01-01T01:00:00+07:00')), { startDate: '2025-12-25', endDate: '2025-12-31' })
  assert.deepEqual(getArticleViewWindow(new Date('2024-03-01T12:00:00Z')), { startDate: '2024-02-24', endDate: '2024-03-01' })
})
