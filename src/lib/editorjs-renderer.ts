import { createHighlighter, type Highlighter } from 'shiki'

export type OutputData = {
  time?: number
  blocks: Block[]
  version?: string
}

type Block = {
  id?: string
  type: string
  data: Record<string, unknown>
}

type ListItem = {
  content: string
  items: ListItem[]
}

const SHIKI_THEMES = { dark: 'github-dark', light: 'github-light' } as const
const SHIKI_LANGS = [
  'typescript', 'javascript', 'tsx', 'jsx', 'json', 'bash', 'css', 'html',
  'yaml', 'sql', 'dockerfile', 'go', 'rust', 'python', 'ruby', 'dart',
  'kotlin', 'swift', 'markdown',
] as const

let highlighterPromise: Promise<Highlighter> | null = null

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [SHIKI_THEMES.dark, SHIKI_THEMES.light],
      langs: [...SHIKI_LANGS],
    })
  }
  return highlighterPromise
}

const ALLOWED_TAGS = new Set([
  'b', 'i', 'em', 'strong', 'a', 'code', 'mark', 'br', 'u', 's',
])

function sanitizeInlineHtml(html: string): string {
  return html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (match, tag) => {
    const lower = tag.toLowerCase()
    if (ALLOWED_TAGS.has(lower)) return match
    return ''
  })
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderListItems(items: ListItem[], style: string): string {
  const tag = style === 'ordered' ? 'ol' : 'ul'
  return items.map((item) => {
    const children = item.items?.length
      ? `<${tag}>${renderListItems(item.items, style)}</${tag}>`
      : ''
    return `<li>${sanitizeInlineHtml(item.content)}${children}</li>`
  }).join('')
}

async function renderBlock(block: Block, highlighter: Highlighter): Promise<string> {
  const { type, data } = block

  switch (type) {
    case 'paragraph':
      return `<p>${sanitizeInlineHtml(data.text as string)}</p>`

    case 'header': {
      const level = Math.min(Math.max(data.level as number, 1), 6)
      return `<h${level}>${sanitizeInlineHtml(data.text as string)}</h${level}>`
    }

    case 'list': {
      const tag = (data.style as string) === 'ordered' ? 'ol' : 'ul'
      const items = data.items as ListItem[]
      return `<${tag}>${renderListItems(items, data.style as string)}</${tag}>`
    }

    case 'quote': {
      const cite = data.caption
        ? `<cite>${sanitizeInlineHtml(data.caption as string)}</cite>`
        : ''
      return `<blockquote><p>${sanitizeInlineHtml(data.text as string)}</p>${cite}</blockquote>`
    }

    case 'code': {
      const code = data.code as string
      const lang = (data.language as string) || 'text'
      const supported = (SHIKI_LANGS as readonly string[]).includes(lang)
      if (supported) {
        return highlighter.codeToHtml(code, {
          themes: SHIKI_THEMES,
          lang,
          defaultColor: false,
        })
      }
      return `<pre><code>${escapeHtml(code)}</code></pre>`
    }

    case 'delimiter':
      return '<hr />'

    case 'image': {
      const file = data.file as { url: string } | undefined
      const url = file?.url ?? (data.url as string) ?? ''
      const caption = (data.caption as string) || ''
      const alt = caption ? sanitizeInlineHtml(caption) : ''
      const captionHtml = caption
        ? `<figcaption>${sanitizeInlineHtml(caption)}</figcaption>`
        : ''
      return `<figure><img src="${escapeHtml(url)}" alt="${escapeHtml(stripHtml(alt))}" loading="lazy" />${captionHtml}</figure>`
    }

    case 'mermaid':
      return `<div data-mermaid="true" class="mermaid-source">${escapeHtml(data.code as string)}</div>`

    default:
      return ''
  }
}

export async function renderEditorJs(data: OutputData): Promise<string> {
  const highlighter = await getHighlighter()
  const htmlParts = await Promise.all(
    data.blocks.map((block) => renderBlock(block, highlighter)),
  )
  return htmlParts.join('\n')
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

export function extractText(data: OutputData): string {
  return data.blocks
    .map((block) => {
      const { type, data: d } = block
      switch (type) {
        case 'paragraph':
        case 'header':
          return stripHtml(d.text as string)
        case 'quote':
          return stripHtml(d.text as string)
        case 'list': {
          const flatten = (items: ListItem[]): string =>
            items.map((i) => stripHtml(i.content) + (i.items?.length ? ' ' + flatten(i.items) : '')).join(' ')
          return flatten(d.items as ListItem[])
        }
        case 'code':
          return d.code as string
        case 'mermaid':
          return ''
        default:
          return ''
      }
    })
    .filter(Boolean)
    .join(' ')
}

export function estimateReadingTime(data: OutputData): number {
  const text = extractText(data)
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}
