import { useEffect } from 'react'
import type { RefObject } from 'react'
import { createClientOnlyFn } from '@tanstack/react-start'

// mermaid stays out of the Worker bundle
const loadMermaid = createClientOnlyFn(() => import('mermaid'))

export function useMermaidRenderer(
  containerRef: RefObject<HTMLElement | null>,
  htmlContent: string,
  active: boolean,
) {
  useEffect(() => {
    const el = containerRef.current
    if (!el || !active) return
    const blocks = el.querySelectorAll<HTMLElement>('[data-mermaid]')
    if (blocks.length === 0) return
    let cancelled = false
    loadMermaid().then(({ default: mermaid }) => {
      if (cancelled) return
      const isDark = document.documentElement.classList.contains('dark')
      mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'neutral',
        fontFamily: 'var(--font-code)',
      })
      blocks.forEach(async (block, i) => {
        if (cancelled) return
        const source = block.textContent ?? ''
        const id = `mermaid-${Date.now()}-${i}`
        try {
          const { svg } = await mermaid.render(id, source)
          block.className = 'mermaid-diagram my-8 flex justify-center overflow-x-auto'
          block.removeAttribute('data-mermaid')
          block.innerHTML = svg
        } catch { /* leave as source text */ }
      })
    })
    return () => { cancelled = true }
  }, [containerRef, htmlContent, active])
}
