import { extractText, type OutputData } from '@/lib/editorjs-renderer'

// A post saved without an excerpt gets the opening of its body
export const AUTO_EXCERPT_LENGTH = 160

export function postContentText(content: string): string {
  try {
    const data = JSON.parse(content) as OutputData
    if (!data.blocks || !Array.isArray(data.blocks)) return ''
    return extractText(data)
  } catch {
    return ''
  }
}

export function resolvePostExcerpt(excerpt: string | undefined, content: string): string {
  return excerpt || postContentText(content).slice(0, AUTO_EXCERPT_LENGTH)
}
