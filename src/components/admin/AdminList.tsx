import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))

type Filter = {
  value: string
  onChange: (value: string) => void
  label: string
}

// The screen's title row: name, row count, a filter that `/` focuses, and the
// screen's actions with the primary one last
export function AdminBar({
  title,
  count,
  filter,
  children,
}: {
  title: string
  count?: number
  filter?: Filter
  children?: ReactNode
}) {
  const input = useRef<HTMLInputElement>(null)
  const hasFilter = filter !== undefined

  useEffect(() => {
    if (!hasFilter) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
      if (isTypingTarget(event.target)) return
      event.preventDefault()
      input.current?.focus()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [hasFilter])

  return (
    <div className="admin-bar">
      <h1>{title}</h1>
      {count !== undefined && <span className="admin-count">{count}</span>}
      <span className="admin-bar__space" />
      {filter && (
        <label className="admin-filter">
          <Search size={14} aria-hidden="true" />
          <span className="sr-only">{filter.label}</span>
          <input
            ref={input}
            type="search"
            placeholder="Filter"
            value={filter.value}
            onChange={(event) => filter.onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                filter.onChange('')
                event.currentTarget.blur()
              }
            }}
          />
          <kbd aria-hidden="true">/</kbd>
        </label>
      )}
      {children}
    </div>
  )
}

export function useCollapsedGroups() {
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set())
  const toggle = useCallback((key: string) => {
    setCollapsed((current) => {
      const next = new Set(current)
      if (!next.delete(key)) next.add(key)
      return next
    })
  }, [])
  const collapseAll = useCallback((keys: string[]) => setCollapsed(new Set(keys)), [])
  const expandAll = useCallback(() => setCollapsed(new Set()), [])
  return {
    isOpen: (key: string) => !collapsed.has(key),
    anyOpen: (keys: string[]) => keys.some((key) => !collapsed.has(key)),
    toggle,
    collapseAll,
    expandAll,
  }
}

export function GroupHeaderRow({
  id,
  label,
  count,
  colSpan,
  open,
  onToggle,
  action,
}: {
  id: string
  label: string
  count: number
  colSpan: number
  open: boolean
  onToggle: () => void
  action?: ReactNode
}) {
  return (
    <tr className="admin-group" data-open={open}>
      <th colSpan={colSpan} scope="colgroup" id={id}>
        <button type="button" aria-expanded={open} onClick={onToggle}>
          <ChevronDown size={13} aria-hidden="true" />
          {label}
          <span className="admin-count">{count}</span>
        </button>
        {action}
      </th>
    </tr>
  )
}

export function ListEmpty({
  icon: Icon,
  title,
  children,
  actions,
}: {
  icon: LucideIcon
  title: string
  children: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="admin-empty">
      <div className="admin-empty__art" aria-hidden="true">
        <Icon size={24} />
      </div>
      <h2>{title}</h2>
      <p>{children}</p>
      {actions && <div className="admin-empty__actions">{actions}</div>}
    </div>
  )
}

export function ListFoot({ children }: { children: ReactNode }) {
  return <div className="admin-foot">{children}</div>
}
