import { drizzle } from 'drizzle-orm/d1'
import type { SQLiteTable } from 'drizzle-orm/sqlite-core'
import { getPlatformProxy } from 'wrangler'
import * as schema from './schema'

// Opens the local D1 database that `pnpm dev` uses (.wrangler/state)
export async function openSeedDb() {
  const proxy = await getPlatformProxy<Env>({ remoteBindings: false })
  return {
    db: drizzle(proxy.env.DB, { schema }),
    close: () => proxy.dispose(),
  }
}

type SeedDb = Awaited<ReturnType<typeof openSeedDb>>['db']

// One statement per row: D1 allows at most 100 bound parameters per query
export async function insertEach<T extends SQLiteTable>(
  db: SeedDb,
  table: T,
  rows: T['$inferInsert'][],
): Promise<void> {
  const [first, ...rest] = rows.map((row) => db.insert(table).values(row))
  if (!first) return
  await db.batch([first, ...rest])
}
