import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
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

export function TableOfContentsLayout({
  headings,
  children,
}: {
  headings: Heading[]
  children: ReactNode
}) {
  const entries = useMemo(() => selectTocHeadings(headings), [headings])
  const activeId = useActiveHeadingId(entries)
  const hasContents = entries.length > 0

  return (
    <div className="post-split" data-contents={hasContents ? 'gutter' : undefined}>
      <div className="post-split__body">
        {hasContents && (
          <details className="post-toc--collapsible">
            <summary>On this page</summary>
            <TocLinks headings={entries} activeId={activeId} />
          </details>
        )}
        {children}
      </div>
      {hasContents && (
        <nav className="post-toc--gutter" aria-label="On this page">
          <p className="post-toc__title">On this page</p>
          <TocLinks headings={entries} activeId={activeId} />
        </nav>
      )}
    </div>
  )
}
