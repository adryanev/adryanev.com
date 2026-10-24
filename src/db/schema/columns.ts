import { integer } from 'drizzle-orm/sqlite-core'

// SQLite has no timestamp type; store UTC epoch milliseconds and read them back as Date
export const timestamp = (name: string) =>
  integer(name, { mode: 'timestamp_ms' })

export const createdAt = () =>
  timestamp('created_at').notNull().$defaultFn(() => new Date())

export const updatedAt = () =>
  timestamp('updated_at').notNull().$defaultFn(() => new Date())

export const boolean = (name: string) => integer(name, { mode: 'boolean' })

export const id = () => integer('id').primaryKey({ autoIncrement: true })
