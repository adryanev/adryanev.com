import { useEffect } from 'react'
import type { RefObject } from 'react'
import { createClientOnlyFn } from '@tanstack/react-start'
import { isCodeLanguage } from '@/lib/code-languages'

// Shiki stays out of the Worker bundle and off its CPU budget
const loadHighlighter = createClientOnlyFn(() => import('@/lib/code-highlighter'))

export function useCodeHighlighter(
  containerRef: RefObject<HTMLElement | null>,
  htmlContent: string,
) {
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const blocks = el.querySelectorAll<HTMLElement>('pre[data-code-language]')
    if (blocks.length === 0) return
    let cancelled = false
    loadHighlighter().then(({ highlightCode }) => {
      blocks.forEach(async (block) => {
        const language = block.dataset.codeLanguage ?? ''
        if (cancelled || !isCodeLanguage(language)) return
        try {
          const html = await highlightCode(block.textContent ?? '', language)
          if (cancelled) return
          // Restyle the existing <pre> in place so controls attached to it survive
          const template = document.createElement('template')
          template.innerHTML = html
          const highlighted = template.content.querySelector('pre')
          const highlightedCode = highlighted?.querySelector('code')
          const code = block.querySelector('code')
          if (!highlighted || !highlightedCode || !code) return
          block.className = highlighted.className
          block.setAttribute('style', highlighted.getAttribute('style') ?? '')
          code.replaceWith(highlightedCode)
        } catch { /* leave as plain code */ }
      })
    })
    return () => { cancelled = true }
  }, [containerRef, htmlContent])
}
