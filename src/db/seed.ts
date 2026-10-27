import { openSeedDb } from './seed-db'
import { siteSettings } from './schema/settings'

async function seed() {
  const { db, close } = await openSeedDb()

  console.log('Seeding database...')

  // ── Site settings ───────────────────────────────────────────
  const settings = [
    { key: 'site_name', value: 'Adryan Eka Vandra' },
    { key: 'site_title', value: 'adryanev.com' },
    { key: 'site_description', value: 'Software Engineer & Developer' },
    { key: 'contact_email', value: 'me@adryanev.com' },
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

  await close()
  console.log('Seeding complete!')
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
