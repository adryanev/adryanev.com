import {
  estimateReadingTime,
  extractText,
  renderPostBody,
  type Heading,
  type OutputData,
} from '@/lib/editorjs-renderer'
import { isContentEdit } from '@/lib/post-dates'
import { resolvePostExcerpt } from '@/lib/post-excerpt'
import { slugify } from '@/lib/slugify'

export type PostDraft = {
  title: string
  slug: string
  content: string
  excerpt: string
  coverImage: string
  tags: string[]
}

export type SavedPost = {
  title: string
  excerpt: string | null
  content: string
  publishedAt: Date | null
  updatedAt: Date
}

export type PostPreview = {
  path: string
  title: string
  excerpt: string
  coverImage: string | null
  publishedAt: Date
  updatedAt: Date
  readingTime: number
  tags: { name: string; slug: string }[]
  content: OutputData
  headings: Heading[]
}

export function parsePostContent(content: string): OutputData {
  try {
    const data = JSON.parse(content) as OutputData
    if (data && Array.isArray(data.blocks)) return data
  } catch {
    /* an untouched editor holds no JSON yet */
  }
  return { blocks: [] }
}

export function countWords(content: OutputData): number {
  return extractText(content).split(/\s+/).filter(Boolean).length
}

// The article as readers would get it if the draft were published now:
// the same excerpt fallback, slug and date stamps the save path applies
export function buildPostPreview(
  draft: PostDraft,
  saved: SavedPost | null,
  now: Date,
): PostPreview {
  const content = parsePostContent(draft.content)
  const excerpt = resolvePostExcerpt(draft.excerpt, draft.content)
  const unchangedSince =
    saved &&
    !isContentEdit(saved, { title: draft.title, excerpt, content: draft.content })
      ? saved.updatedAt
      : null

  return {
    path: `/blog/${draft.slug || slugify(draft.title)}`,
    title: draft.title,
    excerpt,
    coverImage: draft.coverImage || null,
    publishedAt: saved?.publishedAt ?? now,
    updatedAt: unchangedSince ?? now,
    readingTime: estimateReadingTime(content),
    tags: draft.tags.map((name) => ({ name, slug: slugify(name) })),
    content,
    headings: renderPostBody(content).headings,
  }
}
