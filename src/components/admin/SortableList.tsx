import { AnimatePresence, Reorder, useDragControls } from 'motion/react'
import { GripVertical } from 'lucide-react'
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { Key, MutableRefObject, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { moveItem } from '@/lib/reorder'
import { FormError } from '@/components/ui'
import { rowPresence } from './motion'
import type { OrderStatus } from '@/hooks/usePersistedOrder'

type SortableListProps<T> = {
  items: T[]
  getKey: (item: T) => Key
  itemLabel: (item: T) => string
  // Called on every intermediate position while dragging
  onMove: (next: T[]) => void
  // Called once per drop and once per keyboard move
  onDrop: (next: T[]) => void
  enabled?: boolean
  as: 'div' | 'tbody' | 'ul'
  itemAs: 'article' | 'tr' | 'li'
  className?: string
  highlightKey?: Key | null
  children: (item: T, handle: ReactNode) => ReactNode
}

export function SortableList<T>({
  items,
  getKey,
  itemLabel,
  onMove,
  onDrop,
  enabled = true,
  as,
  itemAs,
  className,
  highlightKey,
  children,
}: SortableListProps<T>) {
  const latest = useRef(items)
  latest.current = items
  const focusAfterMove = useRef<Key | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const instructionsId = useId()

  const moveBy = (item: T, offset: -1 | 1) => {
    const from = latest.current.indexOf(item)
    const to = from + offset
    if (from < 0 || to < 0 || to >= latest.current.length) return
    const next = moveItem(latest.current, from, to)
    latest.current = next
    focusAfterMove.current = getKey(item)
    onMove(next)
    onDrop(next)
    setAnnouncement(
      `${itemLabel(item)} moved to position ${to + 1} of ${next.length}`,
    )
  }

  return (
    <>
      <Reorder.Group
        as={as}
        axis="y"
        values={items}
        onReorder={onMove}
        className={className}
      >
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <SortableItem
              key={getKey(item)}
              itemKey={getKey(item)}
              item={item}
              as={itemAs}
              highlighted={highlightKey === getKey(item)}
              label={itemLabel(item)}
              enabled={enabled}
              instructionsId={instructionsId}
              focusAfterMove={focusAfterMove}
              onDragEnd={() => onDrop(latest.current)}
              onKeyMove={(offset) => moveBy(item, offset)}
              render={children}
            />
          ))}
        </AnimatePresence>
      </Reorder.Group>
      <BodyPortal>
        <p id={instructionsId} hidden>
          Press Arrow Up or Arrow Down to move this item.
        </p>
        <p className="sr-only" aria-live="assertive">
          {announcement}
        </p>
      </BodyPortal>
    </>
  )
}

function SortableItem<T>({
  itemKey,
  item,
  as,
  highlighted,
  label,
  enabled,
  instructionsId,
  focusAfterMove,
  onDragEnd,
  onKeyMove,
  render,
}: {
  itemKey: Key
  item: T
  as: 'article' | 'tr' | 'li'
  highlighted: boolean
  label: string
  enabled: boolean
  instructionsId: string
  focusAfterMove: MutableRefObject<Key | null>
  onDragEnd: () => void
  onKeyMove: (offset: -1 | 1) => void
  render: (item: T, handle: ReactNode) => ReactNode
}) {
  const controls = useDragControls()
  const handleRef = useRef<HTMLButtonElement>(null)

  // Moving a keyed node in the DOM drops its focus, so the handle takes it back
  useLayoutEffect(() => {
    if (focusAfterMove.current !== itemKey) return
    focusAfterMove.current = null
    handleRef.current?.focus()
  })

  const handle = enabled ? (
    <button
      ref={handleRef}
      type="button"
      className="admin-grip"
      aria-label={'Move ' + label}
      aria-describedby={instructionsId}
      onPointerDown={(event) => {
        event.preventDefault()
        controls.start(event)
      }}
      onKeyDown={(event) => {
        if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
        event.preventDefault()
        onKeyMove(event.key === 'ArrowUp' ? -1 : 1)
      }}
    >
      <GripVertical size={16} aria-hidden="true" />
    </button>
  ) : null

  return (
    <Reorder.Item
      as={as}
      value={item}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDragEnd}
      data-highlight={highlighted || undefined}
      {...rowPresence}
    >
      {render(item, handle)}
    </Reorder.Item>
  )
}

// Keeps the live region and instructions out of table markup, where a <p>
// is not allowed beside a <tbody>
function BodyPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted ? createPortal(children, document.body) : null
}

export function OrderStatusNotice({ status }: { status: OrderStatus }) {
  if (status.kind === 'failed') return <FormError message={status.message} />
  return (
    <p role="status" className="admin-status">
      {status.kind === 'saving'
        ? 'Saving order…'
        : status.kind === 'saved'
          ? 'Order saved'
          : ''}
    </p>
  )
}
