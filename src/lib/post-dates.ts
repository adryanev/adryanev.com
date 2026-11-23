const DAY_MS = 24 * 60 * 60 * 1000

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
