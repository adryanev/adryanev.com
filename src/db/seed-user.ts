import { hashPassword } from '../lib/password'
import { openSeedDb } from './seed-db'
import { users } from './schema/users'

async function seedUser() {
  const { db, close } = await openSeedDb()

  const email = process.env.ADMIN_EMAIL ?? 'admin@adryanev.com'
  const password = process.env.ADMIN_PASSWORD ?? 'changeme'
  const passwordHash = await hashPassword(password)

  await db
    .insert(users)
    .values({ email, passwordHash })
    .onConflictDoUpdate({
      target: users.email,
      set: { passwordHash },
    })

  console.log(`Admin user upserted: ${email}`)

  await close()
}

seedUser().catch((err) => {
  console.error('User seed failed:', err)
  process.exit(1)
})
