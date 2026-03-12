import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import pg from 'pg'

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
})

const db = drizzle(pool)

const client = await pool.connect()
try {
  await client.query('SELECT pg_advisory_lock(1)')
  console.log('Running migrations...')
  await migrate(db, { migrationsFolder: './drizzle' })
  console.log('Migrations complete.')
} finally {
  await client.query('SELECT pg_advisory_unlock(1)')
  client.release()
}
await pool.end()
