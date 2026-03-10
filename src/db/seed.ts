import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { hash } from 'argon2'
import { users } from './schema/users'
import { portfolioCategories } from './schema/portfolio'
import { siteSettings } from './schema/settings'

async function seed() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })
  const db = drizzle(pool)

  console.log('Seeding database...')

  // Seed admin user
  const email = process.env.ADMIN_EMAIL ?? 'admin@adryanev.com'
  const password = process.env.ADMIN_PASSWORD ?? 'changeme'
  const passwordHash = await hash(password)

  await db
    .insert(users)
    .values({ email, passwordHash })
    .onConflictDoNothing({ target: users.email })

  console.log(`Admin user seeded: ${email}`)

  // Seed portfolio categories
  const categories = [
    { name: 'College', slug: 'college', description: 'University projects and coursework', sortOrder: 0 },
    { name: 'Freelance', slug: 'freelance', description: 'Freelance and contract work', sortOrder: 1 },
    { name: 'TopApp.id', slug: 'topapp-id', description: 'Projects at TopApp.id', sortOrder: 2 },
    { name: 'Work', slug: 'work', description: 'Professional work projects', sortOrder: 3 },
    { name: 'Apple Developer Academy', slug: 'apple-developer-academy', description: 'Projects from Apple Developer Academy', sortOrder: 4 },
    { name: 'Lexicon', slug: 'lexicon', description: 'Projects at Lexicon', sortOrder: 5 },
  ]

  for (const category of categories) {
    await db
      .insert(portfolioCategories)
      .values(category)
      .onConflictDoNothing({ target: portfolioCategories.slug })
  }

  console.log(`Portfolio categories seeded: ${categories.length} categories`)

  // Seed site settings
  const settings = [
    { key: 'site_name', value: 'Adryan Eka Vandra' },
    { key: 'site_title', value: 'adryanev.com' },
    { key: 'site_description', value: 'Software Engineer & Developer' },
    { key: 'contact_email', value: 'hello@adryanev.com' },
    { key: 'github_url', value: 'https://github.com/adryanev' },
    { key: 'linkedin_url', value: 'https://linkedin.com/in/adryanev' },
  ]

  for (const setting of settings) {
    await db
      .insert(siteSettings)
      .values(setting)
      .onConflictDoNothing({ target: siteSettings.key })
  }

  console.log(`Site settings seeded: ${settings.length} settings`)

  await pool.end()
  console.log('Seeding complete!')
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
