import { useCallback, useEffect, useRef, useState } from 'react'

export type OrderStatus =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'saved' }
  | { kind: 'failed'; message: string }

const SAVED_NOTICE_MS = 2500

const sameOrder = (a: { id: number }[], b: { id: number }[]) =>
  a.length === b.length && a.every((item, index) => item.id === b[index].id)

// Holds a list's order locally so drags render at once, saves each dropped
// order, and falls back to the last order the server accepted when a save fails.
// Saves run one after another so the server always ends on the newest order.
export function usePersistedOrder<T extends { id: number }>(
  source: T[],
  save: (ids: number[]) => Promise<unknown>,
) {
  const [items, setItems] = useState(source)
  const [renderedSource, setRenderedSource] = useState(source)
  const [status, setStatus] = useState<OrderStatus>({ kind: 'idle' })
  // Adopt fresh loader data in the same render, so an edited row never shows
  // its old values for a frame
  if (source !== renderedSource) {
    setRenderedSource(source)
    setItems(source)
  }
  const accepted = useRef(source)
  const requested = useRef(source)
  const queue = useRef<Promise<void>>(Promise.resolve())
  const latestRequest = useRef(0)
  const savedTimer = useRef<ReturnType<typeof setTimeout>>()
  const saveRef = useRef(save)
  saveRef.current = save

  useEffect(() => {
    accepted.current = source
    requested.current = source
  }, [source])

  useEffect(() => () => clearTimeout(savedTimer.current), [])

  const commit = useCallback((next: T[]) => {
    setItems(next)
    if (sameOrder(next, requested.current)) return
    requested.current = next
    const request = ++latestRequest.current
    const ids = next.map((item) => item.id)
    clearTimeout(savedTimer.current)
    setStatus({ kind: 'saving' })
    queue.current = queue.current
      .then(() => saveRef.current(ids))
      .then(
        () => {
          accepted.current = next
          if (request !== latestRequest.current) return
          setStatus({ kind: 'saved' })
          savedTimer.current = setTimeout(
            () => setStatus({ kind: 'idle' }),
            SAVED_NOTICE_MS,
          )
        },
        (error: unknown) => {
          if (request !== latestRequest.current) return
          requested.current = accepted.current
          setItems(accepted.current)
          setStatus({
            kind: 'failed',
            message:
              'The new order could not be saved, so the previous order is back. ' +
              (error instanceof Error ? error.message : ''),
          })
        },
      )
  }, [])

  return { items, move: setItems, commit, status }
}
