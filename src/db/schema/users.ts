import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { createdAt, id } from './columns'
import { sessions } from './sessions'

export const users = sqliteTable('users', {
  id: id(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: createdAt(),
})

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}))
