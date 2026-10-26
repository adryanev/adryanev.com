import { createHighlighterCore, type HighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import type { CodeLanguage } from '@/lib/code-languages'

// Browser-only: blog posts and the admin editor highlight code client-side so
// Shiki never runs inside the Worker's 10 ms CPU budget.
const CODE_THEMES = { dark: 'github-dark', light: 'github-light' } as const

const LANGUAGE_GRAMMARS = {
  typescript: () => import('shiki/langs/typescript.mjs'),
  javascript: () => import('shiki/langs/javascript.mjs'),
  tsx: () => import('shiki/langs/tsx.mjs'),
  jsx: () => import('shiki/langs/jsx.mjs'),
  json: () => import('shiki/langs/json.mjs'),
  bash: () => import('shiki/langs/bash.mjs'),
  css: () => import('shiki/langs/css.mjs'),
  html: () => import('shiki/langs/html.mjs'),
  yaml: () => import('shiki/langs/yaml.mjs'),
  sql: () => import('shiki/langs/sql.mjs'),
  dockerfile: () => import('shiki/langs/dockerfile.mjs'),
  go: () => import('shiki/langs/go.mjs'),
  rust: () => import('shiki/langs/rust.mjs'),
  python: () => import('shiki/langs/python.mjs'),
  ruby: () => import('shiki/langs/ruby.mjs'),
  dart: () => import('shiki/langs/dart.mjs'),
  kotlin: () => import('shiki/langs/kotlin.mjs'),
  swift: () => import('shiki/langs/swift.mjs'),
  markdown: () => import('shiki/langs/markdown.mjs'),
} satisfies Record<CodeLanguage, unknown>

let highlighterPromise: Promise<HighlighterCore> | null = null

function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [
        import('shiki/themes/github-dark.mjs'),
        import('shiki/themes/github-light.mjs'),
      ],
      langs: Object.values(LANGUAGE_GRAMMARS).map((load) => load()),
      // The JavaScript engine avoids downloading Oniguruma's WebAssembly
      engine: createJavaScriptRegexEngine(),
    })
  }
  return highlighterPromise
}

export async function highlightCode(
  code: string,
  language: CodeLanguage,
): Promise<string> {
  const highlighter = await getHighlighter()
  return highlighter.codeToHtml(code, {
    themes: CODE_THEMES,
    lang: language,
    defaultColor: false,
  })
}
