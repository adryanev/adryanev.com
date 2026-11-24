import { useEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { useMermaidRenderer } from '@/hooks/useMermaidRenderer'
import { useCodeHighlighter } from '@/hooks/useCodeHighlighter'
import { renderPostBody, type OutputData } from '@/lib/editorjs-renderer'
import './post-body.css'

const COPY_LABEL = 'Copy'
const COPIED_LABEL = 'Copied'
const COPIED_RESET_MS = 1600

function useCodeCopyButtons(containerRef: RefObject<HTMLElement | null>, html: string) {
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const buttons: HTMLButtonElement[] = []
    const timers = new Set<ReturnType<typeof setTimeout>>()

    container.querySelectorAll<HTMLPreElement>(':scope > pre').forEach((pre) => {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'post-body__copy'
      button.textContent = COPY_LABEL
      button.addEventListener('click', () => {
        const code = pre.querySelector('code')
        if (!code) return
        navigator.clipboard
          .writeText(code.innerText)
          .then(() => {
            button.textContent = COPIED_LABEL
            const timer = setTimeout(() => {
              button.textContent = COPY_LABEL
              timers.delete(timer)
            }, COPIED_RESET_MS)
            timers.add(timer)
          })
          .catch(() => {
            button.textContent = 'Select to copy'
            button.setAttribute(
              'aria-label',
              'Clipboard unavailable. Select the code and copy it manually.',
            )
          })
      })
      pre.appendChild(button)
      buttons.push(button)
    })

    return () => {
      timers.forEach(clearTimeout)
      buttons.forEach((button) => button.remove())
    }
  }, [containerRef, html])
}

export function PostBody({ content }: { content: OutputData }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const html = useMemo(() => renderPostBody(content).html, [content])

  useCodeCopyButtons(containerRef, html)
  useMermaidRenderer(containerRef, html, true)
  useCodeHighlighter(containerRef, html)

  return (
    <div
      ref={containerRef}
      className="post-body"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
