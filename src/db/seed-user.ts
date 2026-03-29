import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { hash } from 'argon2'
import { users } from './schema/users'

async function seedUser() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })
  const db = drizzle(pool)

  const email = process.env.ADMIN_EMAIL ?? 'admin@adryanev.com'
  const password = process.env.ADMIN_PASSWORD ?? 'changeme'
  const passwordHash = await hash(password)

  await db
    .insert(users)
    .values({ email, passwordHash })
    .onConflictDoUpdate({
      target: users.email,
      set: { passwordHash },
    })

  console.log(`Admin user upserted: ${email}`)

  await pool.end()
}

seedUser().catch((err) => {
  console.error('User seed failed:', err)
  process.exit(1)
})
