import type { OutputData } from '@editorjs/editorjs'

export function editorContent(value: string): OutputData | null {
  if (!value.trim()) return null
  try {
    const parsed: unknown = JSON.parse(value)
    if (parsed && typeof parsed === 'object' && 'blocks' in parsed && Array.isArray(parsed.blocks)) return parsed as OutputData
  } catch { /* Legacy descriptions contain plain prose. */ }
  const text = value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  return { blocks: text.split(/\r?\n\s*\r?\n/).map((paragraph) => ({ type: 'paragraph', data: { text: paragraph.replace(/\r?\n/g, '<br>') } })) }
}

export function editorContentSignature(value: string): string {
  const blocks = editorContent(value)?.blocks.map(({ type, data, tunes }) => ({
    type, data, ...(tunes && Object.keys(tunes).length ? { tunes } : {}),
  })) ?? []
  return JSON.stringify(blocks, (_key, item: unknown) => {
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      return Object.fromEntries(Object.entries(item).sort(([left], [right]) => left.localeCompare(right)))
    }
    return item
  })
}
