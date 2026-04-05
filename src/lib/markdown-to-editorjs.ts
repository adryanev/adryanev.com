import type { OutputData } from '@editorjs/editorjs'

type Block = OutputData['blocks'][number]

/**
 * Convert a raw markdown string into EditorJS OutputData.
 * Supports: headings, paragraphs, fenced code (with language),
 * blockquotes, ordered/unordered lists, images, horizontal rules,
 * tables, and mermaid code blocks.
 */
export function markdownToEditorJs(md: string): OutputData {
  const lines = md.split('\n')
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Fenced code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim() || 'text'
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing ```
      const code = codeLines.join('\n')
      if (lang === 'mermaid') {
        blocks.push({ type: 'mermaid', data: { code } })
      } else {
        blocks.push({ type: 'code', data: { code, language: lang } })
      }
      continue
    }

    // Horizontal rule
    if (/^(-{3,}|_{3,}|\*{3,})\s*$/.test(line)) {
      blocks.push({ type: 'delimiter', data: {} })
      i++
      continue
    }

    // Table: detect pipe-delimited rows
    if (isTableRow(line) && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const tableResult = parseTable(lines, i)
      blocks.push({
        type: 'table',
        data: {
          withHeadings: true,
          content: tableResult.content,
        },
      })
      i = tableResult.nextIndex
      continue
    }

    // Heading
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      blocks.push({
        type: 'header',
        data: { text: inlineMarkdown(headingMatch[2]), level: headingMatch[1].length },
      })
      i++
      continue
    }

    // Image
    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
    if (imgMatch) {
      blocks.push({
        type: 'image',
        data: { file: { url: imgMatch[2] }, caption: imgMatch[1], withBorder: false, stretched: false, withBackground: false },
      })
      i++
      continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const quoteLines: string[] = []
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2))
        i++
      }
      blocks.push({
        type: 'quote',
        data: { text: inlineMarkdown(quoteLines.join(' ')), caption: '', alignment: 'left' },
      })
      continue
    }

    // Unordered list
    if (/^[-*+]\s/.test(line)) {
      const items = parseListItems(lines, i, 'unordered')
      blocks.push({
        type: 'list',
        data: { style: 'unordered', items: items.items },
      })
      i = items.nextIndex
      continue
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items = parseListItems(lines, i, 'ordered')
      blocks.push({
        type: 'list',
        data: { style: 'ordered', items: items.items },
      })
      i = items.nextIndex
      continue
    }

    // Empty line (skip)
    if (line.trim() === '') {
      i++
      continue
    }

    // Paragraph: collect consecutive non-empty, non-special lines
    const paraLines: string[] = []
    while (i < lines.length && lines[i].trim() !== '' && !isBlockStart(lines[i])) {
      paraLines.push(lines[i])
      i++
    }
    if (paraLines.length > 0) {
      blocks.push({
        type: 'paragraph',
        data: { text: inlineMarkdown(paraLines.join(' ')) },
      })
    }
  }

  return { time: Date.now(), blocks, version: '2.31.0' }
}

function isTableRow(line: string): boolean {
  return line.includes('|') && line.trim().startsWith('|')
}

function isTableSeparator(line: string): boolean {
  return /^\|[\s:|-]+\|$/.test(line.trim())
}

function parseTableRow(line: string): string[] {
  return line.split('|')
    .slice(1, -1) // remove leading/trailing empty splits from outer pipes
    .map((cell) => inlineMarkdown(cell.trim()))
}

function parseTable(lines: string[], startIndex: number): { content: string[][]; nextIndex: number } {
  const content: string[][] = []
  let i = startIndex

  // Header row
  content.push(parseTableRow(lines[i]))
  i++ // skip header

  // Separator row
  i++ // skip separator (---|---|---)

  // Body rows
  while (i < lines.length && isTableRow(lines[i])) {
    content.push(parseTableRow(lines[i]))
    i++
  }

  return { content, nextIndex: i }
}

function isBlockStart(line: string): boolean {
  return /^#{1,6}\s/.test(line) ||
    line.startsWith('```') ||
    line.startsWith('> ') ||
    /^[-*+]\s/.test(line) ||
    /^\d+\.\s/.test(line) ||
    /^(-{3,}|_{3,}|\*{3,})\s*$/.test(line) ||
    /^!\[/.test(line) ||
    (isTableRow(line))
}

/** Convert inline markdown (bold, italic, code, links) to HTML tags that EditorJS understands */
function inlineMarkdown(text: string): string {
  return text
    // inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // bold (**text** or __text__)
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/(?<![a-zA-Z0-9])__(.+?)__(?![a-zA-Z0-9])/g, '<b>$1</b>')
    // italic (*text* or _text_)
    .replace(/\*(.+?)\*/g, '<i>$1</i>')
    .replace(/(?<![a-zA-Z0-9])_(.+?)_(?![a-zA-Z0-9])/g, '<i>$1</i>')
    // strikethrough
    .replace(/~~(.+?)~~/g, '<s>$1</s>')
    // links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
}

type ListItem = { content: string; items: ListItem[] }

function parseListItems(
  lines: string[],
  startIndex: number,
  style: 'ordered' | 'unordered',
): { items: ListItem[]; nextIndex: number } {
  const items: ListItem[] = []
  let i = startIndex
  const bulletPattern = style === 'ordered' ? /^(\s*)\d+\.\s(.*)/ : /^(\s*)[-*+]\s(.*)/

  while (i < lines.length) {
    const match = lines[i].match(bulletPattern)
    if (!match) break

    const indent = match[1].length
    if (indent > 0 && items.length > 0) {
      // Nested item: collect nested lines and parse recursively
      const nestedLines: string[] = []
      while (i < lines.length) {
        const nestedMatch = lines[i].match(bulletPattern)
        if (!nestedMatch || nestedMatch[1].length < indent) break
        // De-indent for recursive parsing
        nestedLines.push(lines[i].slice(indent))
        i++
      }
      const nested = parseListItems(nestedLines, 0, style)
      items[items.length - 1].items = nested.items
    } else {
      items.push({ content: inlineMarkdown(match[2]), items: [] })
      i++
    }
  }

  return { items, nextIndex: i }
}
