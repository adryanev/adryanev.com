import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import rehypeShiki from '@shikijs/rehype'
import type { Root, Element, Text } from 'hast'
import { visit } from 'unist-util-visit'

/**
 * Custom sanitize schema that extends the defaults to allow
 * Shiki's syntax-highlighting output (classes, inline styles, data-* attrs).
 */
const shikiSanitizeSchema: typeof defaultSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    pre: [
      ...(defaultSchema.attributes?.pre ?? []),
      'className',
      'style',
      ['dataLanguage', /^[a-zA-Z0-9_-]+$/],
      ['dataTheme', /^[a-zA-Z0-9_-]+$/],
    ],
    code: [
      ...(defaultSchema.attributes?.code ?? []),
      'className',
      'style',
      ['dataLanguage', /^[a-zA-Z0-9_-]+$/],
      ['dataTheme', /^[a-zA-Z0-9_-]+$/],
    ],
    span: [
      ...(defaultSchema.attributes?.span ?? []),
      'className',
      'style',
    ],
    div: [
      ...(defaultSchema.attributes?.div ?? []),
      'className',
      'dataMermaid',
    ],
  },
}

/**
 * Extract mermaid code blocks into <div data-mermaid> elements
 * BEFORE Shiki processes them, so they survive as raw source text.
 */
function rehypeMermaidPre() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (
        node.tagName !== 'pre' ||
        index == null ||
        !parent ||
        !('children' in parent)
      ) return

      const code = node.children[0] as Element | undefined
      if (
        code?.tagName !== 'code' ||
        !Array.isArray(code.properties?.className) ||
        !code.properties.className.includes('language-mermaid')
      ) return

      // Collect the raw text content
      const text = (code.children as Text[])
        .map((c) => c.value ?? '')
        .join('')

      // Replace with a <div data-mermaid> containing the source
      ;(parent.children as Element[])[index] = {
        type: 'element',
        tagName: 'div',
        properties: { 'data-mermaid': 'true', className: ['mermaid-source'] },
        children: [{ type: 'text', value: text }],
      }
    })
  }
}

function createProcessor() {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    // 1. Extract mermaid blocks before Shiki touches them
    .use(rehypeMermaidPre)
    // 2. Shiki syntax highlighting
    .use(rehypeShiki, {
      themes: { dark: 'github-dark', light: 'github-light' },
      defaultLanguage: 'text',
      langs: [
        'typescript',
        'javascript',
        'tsx',
        'jsx',
        'json',
        'bash',
        'css',
        'html',
        'yaml',
        'sql',
        'dockerfile',
        'go',
        'rust',
        'python',
        'ruby',
        'dart',
        'kotlin',
        'swift',
        'markdown',
      ],
    })
    // 3. Sanitize AFTER Shiki so its output is also sanitized.
    //    Custom schema whitelists Shiki's classes, styles, and data-* attrs.
    .use(rehypeSanitize, shikiSanitizeSchema)
    .use(rehypeStringify)
}

let cachedProcessor: ReturnType<typeof createProcessor> | null = null

function getProcessor() {
  if (!cachedProcessor) {
    cachedProcessor = createProcessor()
  }
  return cachedProcessor
}

export async function renderMarkdown(content: string): Promise<string> {
  const processor = getProcessor()
  const result = await processor.process(content)
  return String(result)
}

export function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}
