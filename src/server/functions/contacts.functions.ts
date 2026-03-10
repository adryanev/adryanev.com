import { createServerFn } from '@tanstack/react-start'
import { eq, desc } from 'drizzle-orm'
import { db } from '@/db'
import { contacts } from '@/db/schema/contacts'

export const getContacts = createServerFn({ method: 'GET' }).handler(
  async () => {
    return db.query.contacts.findMany({
      orderBy: desc(contacts.createdAt),
    })
  },
)

export const markContactRead = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: number; isRead: boolean }) => data)
  .handler(async ({ data }) => {
    await db
      .update(contacts)
      .set({ isRead: data.isRead })
      .where(eq(contacts.id, data.id))
    return { success: true }
  })

export const deleteContact = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    await db.delete(contacts).where(eq(contacts.id, data.id))
    return { success: true }
  })
