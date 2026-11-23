import { editorContentSignature } from '@/lib/editor-content'

const DAY_MS = 24 * 60 * 60 * 1000

type PostContent = {
  title: string
  excerpt: string | null
  content: string
}

// The editor stamps every save with a new time and block ids, so the body is
// compared by its blocks, not by its raw JSON
export function isContentEdit(saved: PostContent, next: PostContent): boolean {
  return (
    saved.title !== next.title ||
    (saved.excerpt ?? '') !== (next.excerpt ?? '') ||
    editorContentSignature(saved.content) !== editorContentSignature(next.content)
  )
}

export function shouldShowUpdated(
  publishedAt: Date | string | number | null | undefined,
  updatedAt: Date | string | number | null | undefined,
): boolean {
  if (publishedAt == null || updatedAt == null) return false
  const elapsed = new Date(updatedAt).getTime() - new Date(publishedAt).getTime()
  return elapsed > DAY_MS
}

// Fixed to UTC so the server render and the browser agree on the day
export function formatPostDate(date: Date | string | number): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
