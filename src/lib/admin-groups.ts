import { formatPostDate } from '@/lib/post-dates'

export type RowGroup<T> = { key: string; label: string; rows: T[] }

type Instant = Date | string | number

const DAY_MS = 24 * 60 * 60 * 1000

const DRAFTS_GROUP_KEY = 'drafts'

// Calendar keys are taken in UTC, the same convention formatPostDate uses, so
// the server render and the browser agree on the group a row belongs to
const utcDayKey = (instant: Instant) =>
  new Date(instant).toISOString().slice(0, 10)

const utcMonthKey = (instant: Instant) =>
  new Date(instant).toISOString().slice(0, 7)

const monthLabel = (instant: Instant) =>
  new Date(instant).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })

const newestFirst = (a: Instant, b: Instant) =>
  new Date(b).getTime() - new Date(a).getTime()

function groupInOrder<T>(
  rows: T[],
  keyOf: (row: T) => string,
  labelOf: (row: T) => string,
): RowGroup<T>[] {
  const groups = new Map<string, RowGroup<T>>()
  for (const row of rows) {
    const key = keyOf(row)
    const group = groups.get(key)
    if (group) group.rows.push(row)
    else groups.set(key, { key, label: labelOf(row), rows: [row] })
  }
  return [...groups.values()]
}

type DatedPost = {
  status: 'draft' | 'published'
  publishedAt: Instant | null
  createdAt: Instant
}

const publishDate = (post: DatedPost) => post.publishedAt ?? post.createdAt

// Drafts come first in one group; published posts follow by publish month,
// newest month first
export function groupPostsByMonth<T extends DatedPost>(
  posts: T[],
): RowGroup<T>[] {
  const drafts = posts.filter((post) => post.status === 'draft')
  const published = posts
    .filter((post) => post.status !== 'draft')
    .sort((a, b) => newestFirst(publishDate(a), publishDate(b)))
  const months = groupInOrder(
    published,
    (post) => utcMonthKey(publishDate(post)),
    (post) => monthLabel(publishDate(post)),
  )
  if (drafts.length === 0) return months
  return [{ key: DRAFTS_GROUP_KEY, label: 'Drafts', rows: drafts }, ...months]
}

export function dayLabel(instant: Instant, now: Instant): string {
  const day = utcDayKey(instant)
  if (day === utcDayKey(now)) return 'Today'
  if (day === utcDayKey(new Date(now).getTime() - DAY_MS)) return 'Yesterday'
  return formatPostDate(instant)
}

// One group per UTC calendar day, newest day first
export function groupMessagesByDay<T extends { createdAt: Instant }>(
  messages: T[],
  now: Instant,
): RowGroup<T>[] {
  const sorted = [...messages].sort((a, b) =>
    newestFirst(a.createdAt, b.createdAt),
  )
  return groupInOrder(
    sorted,
    (message) => utcDayKey(message.createdAt),
    (message) => dayLabel(message.createdAt, now),
  )
}

type Category = { id: number; name: string; sortOrder: number }

// Every category gets a group, empty ones included, so each can offer its own
// add action. Projects keep the order they arrive in, which is their rank
// within the category.
export function groupProjectsByCategory<T extends { categoryId: number }>(
  categories: Category[],
  projects: T[],
): RowGroup<T>[] {
  return [...categories]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((category) => ({
      key: String(category.id),
      label: category.name,
      rows: projects.filter((project) => project.categoryId === category.id),
    }))
}
