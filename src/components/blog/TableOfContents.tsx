import { useEffect, useMemo, useState } from 'react'
import type { Heading } from '@/lib/editorjs-renderer'

const MIN_HEADINGS = 3
const TOC_LEVELS = [2, 3]
// A heading counts as current once it passes the top quarter of the viewport
const ACTIVE_ROOT_MARGIN = '0px 0px -75% 0px'

export function selectTocHeadings(headings: Heading[]): Heading[] {
  const entries = headings.filter((heading) => TOC_LEVELS.includes(heading.level))
  return entries.length >= MIN_HEADINGS ? entries : []
}

function useActiveHeadingId(entries: Heading[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const headingIds = entries.map((entry) => entry.id)
    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      (changes) => {
        for (const change of changes) {
          if (change.isIntersecting) visible.add(change.target.id)
          else visible.delete(change.target.id)
        }
        const firstVisible = headingIds.find((id) => visible.has(id))
        if (firstVisible) setActiveId(firstVisible)
      },
      { rootMargin: ACTIVE_ROOT_MARGIN },
    )

    for (const id of headingIds) {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    }
    return () => observer.disconnect()
  }, [entries])

  return activeId
}

function TocLinks({ headings, activeId }: { headings: Heading[]; activeId: string | null }) {
  return (
    <ol className="post-toc__list">
      {headings.map((heading) => (
        <li key={heading.id} data-level={heading.level}>
          <a
            href={`#${heading.id}`}
            aria-current={heading.id === activeId ? 'location' : undefined}
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ol>
  )
}

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const entries = useMemo(() => selectTocHeadings(headings), [headings])
  const activeId = useActiveHeadingId(entries)

  if (entries.length === 0) return null

  return (
    <>
      <details className="post-toc post-toc--collapsible">
        <summary>On this page</summary>
        <TocLinks headings={entries} activeId={activeId} />
      </details>
      <nav className="post-toc post-toc--aside" aria-label="On this page">
        <div className="post-toc__sticky">
          <p className="post-toc__title">On this page</p>
          <TocLinks headings={entries} activeId={activeId} />
        </div>
      </nav>
    </>
  )
}
