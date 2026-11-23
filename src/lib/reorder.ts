// Each list the admin can reorder holds well under this many rows
const MAX_REORDER_IDS = 200

export type ReorderInput = { ids: number[] }

export function parseReorderInput(input: unknown): ReorderInput {
  const ids = (input as { ids?: unknown } | null)?.ids
  if (!Array.isArray(ids) || ids.length === 0)
    throw new Error('Order must list at least one id')
  if (ids.length > MAX_REORDER_IDS)
    throw new Error(`Order can list at most ${MAX_REORDER_IDS} ids`)
  if (!ids.every((id) => Number.isSafeInteger(id) && id > 0))
    throw new Error('Order ids must be positive integers')
  if (new Set(ids).size !== ids.length)
    throw new Error('Order ids must not repeat')
  return { ids: ids as number[] }
}

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  const next = [...items]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}
