import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  dayLabel,
  groupMessagesByDay,
  groupPostsByMonth,
  groupProjectsByCategory,
} from '../src/lib/admin-groups'

const post = (
  id: number,
  status: 'draft' | 'published',
  publishedAt: string | null,
  createdAt = '2026-01-01T00:00:00Z',
) => ({ id, status, publishedAt, createdAt })

const ids = (groups: { rows: { id: number }[] }[]) =>
  groups.map((group) => group.rows.map((row) => row.id))

test('posts group drafts first, then publish months newest first', () => {
  const groups = groupPostsByMonth([
    post(1, 'published', '2026-09-11T10:00:00Z'),
    post(2, 'draft', null),
    post(3, 'published', '2026-10-24T10:00:00Z'),
    post(4, 'published', '2026-10-06T10:00:00Z'),
    post(5, 'draft', null),
  ])
  assert.deepEqual(
    groups.map((group) => group.label),
    ['Drafts', 'October 2026', 'September 2026'],
  )
  assert.deepEqual(ids(groups), [[2, 5], [3, 4], [1]])
})

test('posts with no drafts have no drafts group, and no posts give no groups', () => {
  assert.deepEqual(
    groupPostsByMonth([post(1, 'published', '2026-09-11T10:00:00Z')]).map(
      (group) => group.label,
    ),
    ['September 2026'],
  )
  assert.deepEqual(groupPostsByMonth([]), [])
})

test('a post published late on the last day of a month stays in that month in UTC', () => {
  const groups = groupPostsByMonth([
    post(1, 'published', '2026-10-31T23:59:59Z'),
    post(2, 'published', '2026-11-01T00:00:00Z'),
  ])
  assert.deepEqual(
    groups.map((group) => group.label),
    ['November 2026', 'October 2026'],
  )
})

test('a published post without a publish date falls back to its creation month', () => {
  const groups = groupPostsByMonth([
    post(1, 'published', null, '2026-03-02T00:00:00Z'),
  ])
  assert.deepEqual(groups.map((group) => group.label), ['March 2026'])
})

test('day labels name today and yesterday in UTC, older days by date', () => {
  const now = '2026-11-24T08:00:00Z'
  assert.equal(dayLabel('2026-11-24T00:00:00Z', now), 'Today')
  assert.equal(dayLabel('2026-11-23T23:59:59Z', now), 'Yesterday')
  assert.equal(dayLabel('2026-11-22T12:00:00Z', now), 'November 22, 2026')
})

test('yesterday crosses a month and year boundary', () => {
  assert.equal(
    dayLabel('2025-12-31T18:00:00Z', '2026-01-01T01:00:00Z'),
    'Yesterday',
  )
})

test('messages group per calendar day, newest day first, in any input order', () => {
  const now = '2026-11-24T08:00:00Z'
  const groups = groupMessagesByDay(
    [
      { id: 1, createdAt: '2026-11-18T09:00:00Z' },
      { id: 2, createdAt: '2026-11-24T07:00:00Z' },
      { id: 3, createdAt: '2026-11-23T10:00:00Z' },
      { id: 4, createdAt: '2026-11-24T01:00:00Z' },
      { id: 5, createdAt: '2026-11-18T08:00:00Z' },
    ],
    now,
  )
  assert.deepEqual(
    groups.map((group) => group.label),
    ['Today', 'Yesterday', 'November 18, 2026'],
  )
  assert.deepEqual(ids(groups), [[2, 4], [3], [1, 5]])
})

test('no messages give no groups', () => {
  assert.deepEqual(groupMessagesByDay([], '2026-11-24T08:00:00Z'), [])
})

test('projects group under every category in category order, empty ones included', () => {
  const groups = groupProjectsByCategory(
    [
      { id: 7, name: 'Web', sortOrder: 1 },
      { id: 3, name: 'Mobile', sortOrder: 0 },
      { id: 9, name: 'Tools', sortOrder: 2 },
    ],
    [
      { id: 1, categoryId: 7 },
      { id: 2, categoryId: 3 },
      { id: 4, categoryId: 7 },
    ],
  )
  assert.deepEqual(
    groups.map((group) => [group.key, group.label]),
    [
      ['3', 'Mobile'],
      ['7', 'Web'],
      ['9', 'Tools'],
    ],
  )
  assert.deepEqual(ids(groups), [[2], [1, 4], []])
})
