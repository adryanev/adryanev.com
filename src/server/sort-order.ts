import { eq, sql } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'
import { db } from '@/db'
import { resumeEntries } from '@/db/schema/resume'
import { portfolioCategories, portfolioProjects } from '@/db/schema/portfolio'
import { saasListings } from '@/db/schema/saas'

type SortableTable =
  | typeof resumeEntries
  | typeof portfolioCategories
  | typeof portfolioProjects
  | typeof saasListings

// One update per row: D1 allows at most 100 bound parameters per query
export async function writeSortOrder(table: SortableTable, ids: number[]) {
  const [first, ...rest] = ids.map((id, index) =>
    db.update(table).set({ sortOrder: index }).where(eq(table.id, id)),
  )
  if (!first) return
  await db.batch([first, ...rest])
}

// Evaluated inside the INSERT, so a new row lands after the current last row
// of its list without a separate read
export function nextSortOrder(table: SortableTable, list?: SQL): SQL<number> {
  const where = list ? sql` where ${list}` : sql``
  return sql<number>`(select coalesce(max(${table.sortOrder}), -1) + 1 from ${table}${where})`
}
