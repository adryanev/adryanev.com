import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import rehypeShiki from '@shikijs/rehype'

// Sanitization schema that allows Shiki-generated HTML attributes.
// Shiki runs as a rehype plugin BEFORE sanitize, so all its output
// passes through the sanitizer — no post-process bypass.
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), 'className', 'style'],
    span: [...(defaultSchema.attributes?.span ?? []), 'className', 'style'],
    pre: [
      ...(defaultSchema.attributes?.pre ?? []),
      'className',
      'style',
      'tabindex',
    ],
  },
}

export async function renderMarkdown(content: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    // Shiki runs inside the pipeline, before sanitize
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
      ],
    })
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeStringify)
    .process(content)

  return String(result)
}

export function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}
