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

export async function renderMarkdown(content: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    // 1. Sanitize raw HTML first (before Shiki adds its safe, deterministic output)
    .use(rehypeSanitize, defaultSchema)
    // 2. Extract mermaid blocks before Shiki touches them
    .use(rehypeMermaidPre)
    // 3. Shiki runs AFTER sanitize — its classes & styles won't be stripped
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
    .use(rehypeStringify)
    .process(content)

  return String(result)
}

export function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}
