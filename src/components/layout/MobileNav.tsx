import { Link } from '@tanstack/react-router'
import { X } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'

interface MobileNavProps {
  open: boolean
  onClose: () => void
  items: ReadonlyArray<{ label: string; to: string }>
}

export function MobileNav({ open, onClose, items }: MobileNavProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Auto-focus the close button when the panel opens
  useEffect(() => {
    if (open) {
      closeButtonRef.current?.focus()
    }
  }, [open])

  // Close on Escape key
  useEffect(() => {
    if (!open) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  // Trap focus within the panel
  const handleFocusTrap = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab') return

    const panel = panelRef.current
    if (!panel) return

    const focusable = panel.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }, [])

  useEffect(() => {
    if (!open) return

    document.addEventListener('keydown', handleFocusTrap)
    return () => document.removeEventListener('keydown', handleFocusTrap)
  }, [open, handleFocusTrap])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-text-primary/90 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className="fixed inset-y-0 right-0 w-full max-w-sm border-l-4 border-text-primary bg-bg-primary p-6 brutal-shadow-lg flex flex-col overscroll-contain"
      >
        <div className="flex items-center justify-between border-b border-border pb-4">
          <span className="font-mono text-sm text-text-secondary tracking-wider">
            Navigation
          </span>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center brutal-border bg-accent text-accent-fg transition-transform active:scale-95"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-12 flex flex-col gap-6 flex-1">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className="group flex items-center justify-between border-b border-transparent pb-2 font-serif text-4xl font-bold uppercase tracking-wide text-text-primary transition-colors hover:border-text-primary hover:text-accent hover:italic"
              activeProps={{
                className: '!border-accent !text-accent !italic',
              }}
            >
              {item.label}
              <span className="font-mono text-sm text-text-secondary group-hover:text-accent">
                {'>'}
              </span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-border pt-6 font-mono text-xs text-text-secondary">
          Adryan Eka Vandra &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  )
}
