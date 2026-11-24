import { useEffect, useRef } from 'react'
import type { MouseEvent } from 'react'
import { ExternalLink, X } from 'lucide-react'
import { PostArticleIntro } from '@/components/blog/PostArticleIntro'
import { TableOfContentsLayout } from '@/components/blog/TableOfContents'
import { PostBody } from '@/components/blog/PostBody'
import type { PostPreview } from '@/lib/post-preview'
import { Button } from '@/components/ui'

type FocusReturn = { element: HTMLElement; selection: Range | null }

function rememberFocus(): FocusReturn | null {
  const element = document.activeElement
  if (!(element instanceof HTMLElement) || element === document.body) return null
  const selection = window.getSelection()
  const range =
    element.isContentEditable && selection?.rangeCount
      ? selection.getRangeAt(0).cloneRange()
      : null
  return { element, selection: range }
}

// Typing in the editor resumes at the caret it left
function restoreFocus(target: FocusReturn | null) {
  if (!target?.element.isConnected) return
  target.element.focus({ preventScroll: true })
  if (!target.selection) return
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(target.selection)
}

// The preview shows the article; following its links would leave the editor
function keepNavigationInPreview(event: MouseEvent<HTMLElement>) {
  if (!(event.target instanceof Element)) return
  const link = event.target.closest('a')
  if (!link) return
  event.preventDefault()
  const href = link.getAttribute('href') ?? ''
  if (!href.startsWith('#')) return
  const id = CSS.escape(decodeURIComponent(href.slice(1)))
  event.currentTarget.querySelector(`#${id}`)?.scrollIntoView()
}

export function PostPreviewSheet({
  preview,
  animateOpen,
  publishedUrl,
  onClosed,
}: {
  preview: PostPreview
  animateOpen: boolean
  publishedUrl: string | null
  onClosed: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const focusReturnRef = useRef<FocusReturn | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || dialog.open) return
    focusReturnRef.current = rememberFocus()
    dialog.showModal()
  }, [])

  // A pointer close slides the sheet out; Escape closes at once. With
  // reduced motion there is no animation to wait for.
  const closeWithExit = async () => {
    const dialog = dialogRef.current
    if (!dialog) return
    dialog.dataset.closing = ''
    await Promise.allSettled(dialog.getAnimations().map((animation) => animation.finished))
    dialog.close()
  }

  return (
    <dialog
      ref={dialogRef}
      className="post-preview"
      aria-label="Live preview"
      data-animate={animateOpen || undefined}
      onClose={() => {
        onClosed()
        restoreFocus(focusReturnRef.current)
      }}
    >
      <div className="post-preview__bar">
        <span className="post-preview__live">Live</span>
        <span className="post-preview__path">{preview.path}</span>
        <span className="admin-bar__space" />
        {publishedUrl && (
          <Button asChild size="sm" variant="secondary">
            <a href={publishedUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={14} aria-hidden="true" />
              Open published
            </a>
          </Button>
        )}
        <Button
          size="sm"
          variant="secondary"
          aria-label="Close preview"
          autoFocus
          onClick={closeWithExit}
        >
          <X size={14} aria-hidden="true" />
          <kbd>Esc</kbd>
        </Button>
      </div>
      <div
        className="post-preview__page"
        data-ui-surface="public"
        onClickCapture={keepNavigationInPreview}
      >
        <article className="chapter-page post-article">
          <PostArticleIntro
            title={preview.title}
            excerpt={preview.excerpt}
            publishedAt={preview.publishedAt}
            updatedAt={preview.updatedAt}
            readingTime={preview.readingTime}
            viewCount={null}
            tags={preview.tags}
            coverImage={preview.coverImage}
          />
          <TableOfContentsLayout headings={preview.headings}>
            <PostBody content={preview.content} />
          </TableOfContentsLayout>
        </article>
      </div>
    </dialog>
  )
}
