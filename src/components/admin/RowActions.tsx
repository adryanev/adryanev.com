import { forwardRef, useCallback, useEffect, useRef, useState } from 'react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui'

const CONFIRM_WINDOW_MS = 4000

export function RowActions({ children }: { children: ReactNode }) {
  return <div className="admin-row-actions">{children}</div>
}

type RowActionProps = Omit<
  ComponentPropsWithoutRef<typeof Button>,
  'variant' | 'size'
> & { label: string }

export const RowAction = forwardRef<HTMLButtonElement, RowActionProps>(
  function RowAction({ label, ...props }, ref) {
    return (
      <Button
        {...props}
        ref={ref}
        variant="secondary"
        size="icon"
        aria-label={label}
        title={label}
      />
    )
  },
)

// Two-step delete: the trigger arms the row, and the armed row shows
// "Confirm delete" and Cancel until it times out or Escape is pressed
export function ConfirmDelete({
  onConfirm,
  children,
}: {
  onConfirm: () => void
  children: (arm: () => void) => ReactNode
}) {
  const [armed, setArmed] = useState(false)
  const container = useRef<HTMLSpanElement>(null)
  const confirmButton = useRef<HTMLButtonElement>(null)
  const restoreFocus = useRef(false)

  const disarm = useCallback(() => {
    restoreFocus.current =
      container.current?.contains(document.activeElement) ?? false
    setArmed(false)
  }, [])

  useEffect(() => {
    if (!armed) {
      if (restoreFocus.current) container.current?.querySelector('button')?.focus()
      restoreFocus.current = false
      return
    }
    confirmButton.current?.focus()
    const timer = setTimeout(disarm, CONFIRM_WINDOW_MS)
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') disarm()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [armed, disarm])

  return (
    <span ref={container} className="admin-confirm-delete">
      {armed ? (
        <>
          <Button
            ref={confirmButton}
            variant="danger"
            size="sm"
            onClick={() => {
              disarm()
              onConfirm()
            }}
          >
            Confirm delete
          </Button>
          <Button variant="secondary" size="sm" onClick={disarm}>
            Cancel
          </Button>
        </>
      ) : (
        children(() => setArmed(true))
      )}
    </span>
  )
}

export function DeleteAction({
  label,
  pending,
  onConfirm,
}: {
  label: string
  pending?: boolean
  onConfirm: () => void
}) {
  return (
    <ConfirmDelete onConfirm={onConfirm}>
      {(arm) => (
        <RowAction label={label} disabled={pending} onClick={arm}>
          <Trash2 size={16} aria-hidden="true" />
        </RowAction>
      )}
    </ConfirmDelete>
  )
}
