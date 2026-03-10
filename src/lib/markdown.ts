import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import { createHighlighter } from 'shiki'

let highlighterPromise: ReturnType<typeof createHighlighter> | null = null

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-dark', 'github-light'],
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
        'markdown',
        'sql',
        'python',
        'go',
        'rust',
        'dart',
        'kotlin',
        'swift',
        'diff',
      ],
    })
  }
  return highlighterPromise
}

export async function renderMarkdown(content: string): Promise<string> {
  const highlighter = await getHighlighter()

  // Allow class attributes for syntax highlighting
  const schema = {
    ...defaultSchema,
    attributes: {
      ...defaultSchema.attributes,
      code: [...(defaultSchema.attributes?.code ?? []), 'className', 'style'],
      span: [...(defaultSchema.attributes?.span ?? []), 'className', 'style'],
      pre: [...(defaultSchema.attributes?.pre ?? []), 'className', 'style'],
    },
  }

  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize, schema)
    .use(rehypeStringify)
    .process(content)

  let html = String(result)

  // Post-process: apply shiki highlighting to code blocks
  html = html.replace(
    /<pre><code(?:\s+class="language-(\w+)")?>([\s\S]*?)<\/code><\/pre>/g,
    (_match, lang, code) => {
      const decoded = code
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")

      try {
        return highlighter.codeToHtml(decoded, {
          lang: lang || 'text',
          themes: { dark: 'github-dark', light: 'github-light' },
        })
      } catch {
        return `<pre><code>${code}</code></pre>`
      }
    },
  )

  return html
}

export function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}
