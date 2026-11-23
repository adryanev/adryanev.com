export function parsePage(value: unknown): number | undefined {
  const page = Number(value)
  return Number.isInteger(page) && page > 1 ? page : undefined
}

export function blogListPath(tagSlug: string | undefined, page: number): string {
  const base = tagSlug ? `/blog/tag/${encodeURIComponent(tagSlug)}` : '/blog'
  return page > 1 ? `${base}?page=${page}` : base
}
