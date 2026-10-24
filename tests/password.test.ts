import assert from 'node:assert/strict'
import { test } from 'node:test'
import { hashPassword, verifyPassword } from '../src/lib/password.ts'

test('a hashed password verifies and a different password does not', async () => {
  const stored = await hashPassword('correct horse battery staple')

  assert.equal(await verifyPassword(stored, 'correct horse battery staple'), true)
  assert.equal(await verifyPassword(stored, 'correct horse battery stapl'), false)
})

test('hashing the same password twice uses different salts', async () => {
  const first = await hashPassword('same password')
  const second = await hashPassword('same password')

  assert.notEqual(first, second)
})

test('malformed or foreign hashes never verify', async () => {
  const argon2Hash = '$argon2id$v=19$m=65536,t=3,p=4$c2FsdA$aGFzaA'

  assert.equal(await verifyPassword('', 'anything'), false)
  assert.equal(await verifyPassword('pbkdf2-sha256$100000$onlysalt', 'anything'), false)
  assert.equal(await verifyPassword(argon2Hash, 'anything'), false)
})
