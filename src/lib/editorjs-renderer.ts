import { isCodeLanguage } from '@/lib/code-languages'
import { slugify } from '@/lib/slugify'

export type OutputData = {
  time?: number
  blocks: Block[]
  version?: string
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

type Block = {
  id?: string
  type: string
  data: Record<string, JsonValue>
}

export type Heading = {
  id: string
  text: string
  level: number
}

type RenderContext = {
  headingAnchors: boolean
  headings: Heading[]
  usedHeadingIds: Set<string>
}

type ListItem = {
  content: string
  items: ListItem[]
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

const HTML_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&nbsp;': ' ',
}

function plainText(html: string): string {
  return stripHtml(html)
    .replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, (entity) => HTML_ENTITIES[entity])
    .trim()
}

const FALLBACK_HEADING_ID = 'section'

// Slugs repeat within a post, so later duplicates get -2, -3, ...
function uniqueHeadingId(text: string, used: Set<string>): string {
  const base = slugify(text) || FALLBACK_HEADING_ID
  let id = base
  for (let n = 2; used.has(id); n++) id = `${base}-${n}`
  used.add(id)
  return id
}

function renderHeader(data: Record<string, unknown>, context: RenderContext): string {
  const level = Math.min(Math.max(data.level as number, 1), 6)
  const content = sanitizeInlineHtml(data.text as string)
  if (!context.headingAnchors) return `<h${level}>${content}</h${level}>`

  const text = plainText(content)
  const id = uniqueHeadingId(text, context.usedHeadingIds)
  context.headings.push({ id, text, level })
  const anchor = `<a class="heading-anchor" href="#${id}" aria-label="Link to section: ${escapeHtml(text)}">#</a>`
  return `<h${level} id="${id}">${content}${anchor}</h${level}>`
}

function renderBlock(block: Block, context: RenderContext): string {
  const { type, data } = block

  switch (type) {
    case 'paragraph':
      return `<p>${sanitizeInlineHtml(data.text as string)}</p>`

    case 'header':
      return renderHeader(data, context)

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
      // useCodeHighlighter colours marked blocks in the browser
      const languageAttribute = isCodeLanguage(lang)
        ? ` data-code-language="${lang}"`
        : ''
      return `<pre${languageAttribute}><code>${escapeHtml(code)}</code></pre>`
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

    case 'table': {
      const content = data.content as string[][]
      const withHeadings = data.withHeadings as boolean
      if (!content || content.length === 0) return ''
      const rows = content.map((row, i) => {
        const tag = withHeadings && i === 0 ? 'th' : 'td'
        const cells = row.map((cell) => `<${tag}>${sanitizeInlineHtml(cell)}</${tag}>`).join('')
        return `<tr>${cells}</tr>`
      })
      const headRow = withHeadings ? `<thead>${rows.shift()}</thead>` : ''
      const body = rows.length ? `<tbody>${rows.join('')}</tbody>` : ''
      return `<table>${headRow}${body}</table>`
    }

    case 'embed': {
      const src = data.embed as string
      const caption = (data.caption as string) || ''
      const captionHtml = caption
        ? `<figcaption>${sanitizeInlineHtml(caption)}</figcaption>`
        : ''
      return `<figure class="embed-block"><iframe src="${escapeHtml(src)}" frameborder="0" allowfullscreen loading="lazy"></iframe>${captionHtml}</figure>`
    }

    case 'warning': {
      const title = (data.title as string) || ''
      const message = (data.message as string) || ''
      return `<div class="warning-block"><div class="warning-block__title">${sanitizeInlineHtml(title)}</div><p>${sanitizeInlineHtml(message)}</p></div>`
    }

    case 'raw':
      return data.html as string

    case 'mermaid':
      return `<div data-mermaid="true" class="mermaid-source">${escapeHtml(data.code as string)}</div>`

    default:
      return ''
  }
}

type RenderOptions = {
  // Adds an id and a # link to each heading, for pages that link to sections
  headingAnchors?: boolean
}

export function renderEditorJsWithHeadings(
  data: OutputData,
  options: RenderOptions = {},
): { html: string; headings: Heading[] } {
  const context: RenderContext = {
    headingAnchors: options.headingAnchors ?? false,
    headings: [],
    usedHeadingIds: new Set(),
  }
  const html = data.blocks.map((block) => renderBlock(block, context)).join('\n')
  return { html, headings: context.headings }
}

export function renderEditorJs(data: OutputData, options: RenderOptions = {}): string {
  return renderEditorJsWithHeadings(data, options).html
}

// A post's body and its contents list both come from here, so heading ids match
export function renderPostBody(data: OutputData): { html: string; headings: Heading[] } {
  return renderEditorJsWithHeadings(data, { headingAnchors: true })
}

function parseProjectDescription(description: string): OutputData {
  const text = description.trim()
  if (!text) return { blocks: [] }

  let data: unknown
  try {
    data = JSON.parse(text)
  } catch { /* descriptions predating EditorJS are plain text */ }

  if (data && typeof data === 'object' && 'blocks' in data) {
    return data as OutputData
  }

  return {
    blocks: text.split(/\r?\n\s*\r?\n/).map((paragraph) => ({
      type: 'paragraph',
      data: { text: escapeHtml(paragraph).replace(/\r?\n/g, '<br />') },
    })),
  }
}

// A sentence ends at . ! or ? followed by whitespace and a capital, digit or opening quote
const SENTENCE_END = /[.!?](?=\s+["“(]?[A-Z0-9])/g
const INLINE_TAG = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g

function closesEveryInlineTag(html: string): boolean {
  if (/<[^>]*$/.test(html)) return false
  let open = 0
  for (const [, closing, tag] of html.matchAll(INLINE_TAG)) {
    if (tag.toLowerCase() === 'br') continue
    open += closing ? -1 : 1
  }
  return open === 0
}

// Splits inline HTML after its first sentence, never inside a tag or an open <b>, <a>, ...
function splitFirstSentence(html: string): [first: string, rest: string] {
  for (const match of html.matchAll(SENTENCE_END)) {
    const end = match.index + 1
    const first = html.slice(0, end)
    if (closesEveryInlineTag(first)) return [first, html.slice(end).trim()]
  }
  return [html, '']
}

export type ProjectStory = {
  // The description's first sentence, as inline HTML; empty when it opens with a non-paragraph block
  ledeHtml: string
  // Everything after the lede
  bodyHtml: string
}

export async function renderProjectStory(description: string): Promise<ProjectStory> {
  const { blocks, ...data } = parseProjectDescription(description)
  const [first, ...others] = blocks
  if (first?.type !== 'paragraph') {
    return { ledeHtml: '', bodyHtml: await renderEditorJs({ ...data, blocks }) }
  }

  const [ledeHtml, remainder] = splitFirstSentence(sanitizeInlineHtml(first.data.text as string))
  const bodyBlocks = remainder
    ? [{ ...first, data: { ...first.data, text: remainder } }, ...others]
    : others
  return { ledeHtml, bodyHtml: await renderEditorJs({ ...data, blocks: bodyBlocks }) }
}

// The description's first sentence as plain text, for cards that link to the project
export function projectSummary(description: string): string {
  const [first] = parseProjectDescription(description).blocks
  if (first?.type !== 'paragraph') return ''
  return plainText(splitFirstSentence(sanitizeInlineHtml(first.data.text as string))[0])
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
        case 'warning':
          return [stripHtml(d.title as string), stripHtml(d.message as string)].filter(Boolean).join(' ')
        case 'mermaid':
        case 'embed':
        case 'raw':
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
