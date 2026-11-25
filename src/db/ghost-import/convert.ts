import type { OutputData } from '@editorjs/editorjs'
import { isCodeLanguage } from '../../lib/code-languages'
import { markdownToEditorJs } from '../../lib/markdown-to-editorjs'

// Converts a Ghost 4 post (mobiledoc 0.3) into the EditorJS blocks this site
// stores. Anything it does not recognise throws, because the renderer drops
// unknown blocks without a trace.

type Block = OutputData['blocks'][number]

export type GistFile = { content: string; language: string | null }

export type ConvertContext = {
  // Slugs of the posts being imported; links to other old pages lose their link
  importedSlugs: ReadonlySet<string>
  gists: ReadonlyMap<string, GistFile[]>
}

export type ConvertedPost = {
  blocks: Block[]
  // Paths under Ghost's content/images/ that the blocks reference
  images: string[]
}

export const IMPORTED_MEDIA_PREFIX = '/media/blog/belajarinformatika/'

type Marker = [type: 0 | 1, openMarkups: number[], closedCount: number, value: string | number]
type Markup = [tag: string, attributes?: string[]]
type Card = [name: string, payload: Record<string, unknown>]
type Section =
  | [1, string, Marker[]]
  | [3, string, Marker[][]]
  | [10, number]

type Mobiledoc = {
  version: string
  atoms: [string, string, unknown][]
  cards: Card[]
  markups: Markup[]
  sections: Section[]
}

const OLD_SITE_URL = /(?:__GHOST_URL__|https?:\/\/(?:www\.)?belajarinformatika\.id)(\/[^\s"'<>)\\]*)?/g
const OLD_SITE_LINK = /<a href="((?:__GHOST_URL__|https?:\/\/(?:www\.)?belajarinformatika\.id)[^"]*)">(.*?)<\/a>/g
const IMAGE_PATH = /^\/content\/images\/(.+)$/
const POST_PATH = /^\/([a-z0-9-]+)\/?$/

const INLINE_TAGS: Record<string, string> = { a: 'a', em: 'i', i: 'i', strong: 'b', b: 'b', code: 'code', u: 'u', s: 's' }
const HEADING_LEVELS: Record<string, number> = { h1: 2, h2: 2, h3: 3, h4: 4, h5: 5, h6: 6 }
const LANGUAGE_ALIASES: Record<string, string> = { sh: 'bash', shell: 'bash', vagrant: 'ruby', yml: 'yaml' }
const GIST_SCRIPT = /^<script src="https:\/\/gist\.github\.com\/[\w-]+\/([0-9a-f]+)\.js"><\/script>$/
const IMAGE_BLOCK_DEFAULTS = { withBorder: false, stretched: false, withBackground: false }
// Code shows the old URLs as written
const LITERAL_BLOCKS = new Set(['code', 'mermaid'])

export function convertGhostPost(mobiledocJson: string, context: ConvertContext): ConvertedPost {
  const doc = JSON.parse(mobiledocJson) as Mobiledoc
  if (doc.version !== '0.3.1') throw new Error(`Unsupported mobiledoc version ${doc.version}`)

  const blocks = doc.sections.flatMap((section) => convertSection(section, doc, context))
  const images = new Set<string>()
  const rewritten = blocks.map((block) =>
    LITERAL_BLOCKS.has(block.type)
      ? block
      : rewriteStrings(block, (value) => rewriteOldSiteUrls(value, context, images)),
  )
  return { blocks: rewritten, images: [...images].sort() }
}

// A feature image: an uploaded one moves to /media, an Unsplash one stays hotlinked
export function coverImageUrl(url: string, images: Set<string>): string {
  if (url.startsWith('https://images.unsplash.com/')) return url
  const replacement = newUrl(url, { importedSlugs: new Set(), gists: new Map() }, images)
  if (!replacement?.startsWith(IMPORTED_MEDIA_PREFIX)) throw new Error(`Unsupported feature image: ${url}`)
  return replacement
}

function convertSection(section: Section, doc: Mobiledoc, context: ConvertContext): Block[] {
  switch (section[0]) {
    case 1:
      return convertMarkupSection(section[1], renderMarkers(section[2], doc))
    case 3:
      return [{
        type: 'list',
        data: {
          style: section[1] === 'ol' ? 'ordered' : 'unordered',
          items: section[2].map((markers) => ({ content: renderMarkers(markers, doc), items: [] })),
        },
      }]
    case 10:
      return convertCard(doc.cards[section[1]], context)
    default:
      throw new Error(`Unsupported mobiledoc section ${JSON.stringify(section)}`)
  }
}

function convertMarkupSection(tag: string, html: string): Block[] {
  if (!stripTags(html).trim()) return []
  if (tag === 'p') return [{ type: 'paragraph', data: { text: html } }]
  if (tag === 'blockquote') return [{ type: 'quote', data: { text: html, caption: '', alignment: 'left' } }]
  const level = HEADING_LEVELS[tag]
  if (level) return [{ type: 'header', data: { text: html, level } }]
  throw new Error(`Unsupported markup section <${tag}>`)
}

function renderMarkers(markers: Marker[], doc: Mobiledoc): string {
  const open: string[] = []
  let html = ''
  for (const [type, openMarkups, closedCount, value] of markers) {
    for (const index of openMarkups) {
      const [tag, attributes = []] = doc.markups[index]
      const inlineTag = INLINE_TAGS[tag]
      if (!inlineTag) throw new Error(`Unsupported markup <${tag}>`)
      html += inlineTag === 'a' ? `<a href="${escapeAttribute(attributeValue(attributes, 'href'))}">` : `<${inlineTag}>`
      open.push(inlineTag)
    }
    html += type === 0 ? escapeText(value as string) : renderAtom(doc.atoms[value as number])
    for (let n = 0; n < closedCount; n++) html += `</${open.pop()}>`
  }
  return html
}

function renderAtom([name]: [string, string, unknown]): string {
  if (name === 'soft-return') return '<br>'
  throw new Error(`Unsupported atom ${name}`)
}

function convertCard([name, payload]: Card, context: ConvertContext): Block[] {
  switch (name) {
    case 'code':
      return [
        { type: 'code', data: { code: payload.code as string, language: normalizeLanguage(payload.language as string | undefined) } },
        ...captionBlock(payload.caption),
      ]
    case 'image':
      return [imageBlock(payload.src as string, (payload.caption as string) ?? '')]
    case 'gallery':
      return [
        ...(payload.images as { src: string }[]).map((image) => imageBlock(image.src, '')),
        ...captionBlock(payload.caption),
      ]
    case 'markdown':
      return markdownToEditorJs(simplifyMarkdownHtml(payload.markdown as string)).blocks
    case 'hr':
      return [{ type: 'delimiter', data: {} }]
    case 'bookmark':
      return [bookmarkBlock(payload)]
    case 'embed':
      return [embedBlock(payload)]
    case 'html':
      return gistBlocks(payload.html as string, context)
    default:
      throw new Error(`Unsupported card ${name}`)
  }
}

function imageBlock(src: string, caption: string): Block {
  return { type: 'image', data: { file: { url: src }, caption, ...IMAGE_BLOCK_DEFAULTS } }
}

function captionBlock(caption: unknown): Block[] {
  return typeof caption === 'string' && caption.trim()
    ? [{ type: 'paragraph', data: { text: `<i>${caption}</i>` } }]
    : []
}

function bookmarkBlock(payload: Record<string, unknown>): Block {
  const metadata = (payload.metadata ?? {}) as { title?: string; description?: string }
  const url = payload.url as string
  const title = escapeText(metadata.title || url)
  const description = metadata.description ? `<br>${escapeText(metadata.description)}` : ''
  return { type: 'paragraph', data: { text: `<b><a href="${escapeAttribute(url)}">${title}</a></b>${description}` } }
}

// Ghost stored tweets as Twitter's blockquote widget, which needs Twitter's script
function embedBlock(payload: Record<string, unknown>): Block {
  const url = payload.url as string
  const tweet = url.match(/^https:\/\/twitter\.com\/(\w+)\/status\/\d+/)
  if (!tweet) throw new Error(`Unsupported embed ${url}`)
  const paragraph = (payload.html as string).match(/<p[^>]*>([\s\S]*?)<\/p>/)
  if (!paragraph) throw new Error(`Tweet embed without text ${url}`)
  const text = paragraph[1].replace(/<(?!\/?(?:a|br)\b)[^>]*>/g, '')
  const tweetUrl = url.split('?')[0]
  return { type: 'quote', data: { text, caption: `<a href="${tweetUrl}">@${tweet[1]} on X</a>`, alignment: 'left' } }
}

// Gist script tags do not run inside rendered post HTML, so the gist becomes code
function gistBlocks(html: string, context: ConvertContext): Block[] {
  const gist = html.trim().match(GIST_SCRIPT)
  if (!gist) throw new Error(`Unsupported HTML card ${html.slice(0, 80)}`)
  const files = context.gists.get(gist[1])
  if (!files?.length) throw new Error(`Gist ${gist[1]} was not fetched`)
  return files.map((file) => ({ type: 'code', data: { code: file.content, language: normalizeLanguage(file.language ?? undefined) } }))
}

export function normalizeLanguage(language: string | undefined): string {
  const lower = (language ?? '').trim().toLowerCase()
  const name = LANGUAGE_ALIASES[lower] ?? lower
  return isCodeLanguage(name) ? name : 'text'
}

// Ghost's markdown accepted "##Heading" without a space. The renderer keeps
// only a few inline tags, so rewrite the ones these posts use.
function simplifyMarkdownHtml(markdown: string): string {
  return markdown
    .replace(/^(#{1,6})(?=[^#\s])/gm, '$1 ')
    .replace(/<sup>(.*?)<\/sup>/g, '^$1')
    .replace(/<kbd>([^<`]*)<\/kbd>/g, '`$1`')
    .replace(/<\/?kbd>/g, '')
    .replace(/<\/?[ou]l>/g, '')
    .replace(/<li>\s*/g, '• ')
    .replace(/\s*<\/li>\s*/g, '<br>')
}

function rewriteOldSiteUrls(value: string, context: ConvertContext, images: Set<string>): string {
  const unlinked = value.replace(OLD_SITE_LINK, (link, url: string, text: string) =>
    newUrl(url, context, images) === null ? text : link,
  )
  return unlinked.replace(OLD_SITE_URL, (url) => {
    const replacement = newUrl(url, context, images)
    if (replacement === null) throw new Error(`Old site URL with no new home: ${url}`)
    return replacement
  })
}

function newUrl(url: string, context: ConvertContext, images: Set<string>): string | null {
  const path = url.replace(/^(?:__GHOST_URL__|https?:\/\/(?:www\.)?belajarinformatika\.id)/, '') || '/'
  const image = path.match(IMAGE_PATH)
  if (image) {
    images.add(decodeURIComponent(image[1]))
    return IMPORTED_MEDIA_PREFIX + image[1]
  }
  const post = path.match(POST_PATH)
  if (post && context.importedSlugs.has(post[1])) return `/blog/${post[1]}`
  return null
}

function rewriteStrings<T>(value: T, rewrite: (text: string) => string): T {
  if (typeof value === 'string') return rewrite(value) as T
  if (Array.isArray(value)) return value.map((item) => rewriteStrings(item, rewrite)) as T
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, rewriteStrings(item, rewrite)])) as T
  }
  return value
}

function attributeValue(attributes: string[], name: string): string {
  const index = attributes.indexOf(name)
  return index >= 0 ? attributes[index + 1] : ''
}

function escapeText(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function escapeAttribute(text: string): string {
  return escapeText(text).replace(/"/g, '&quot;')
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}
