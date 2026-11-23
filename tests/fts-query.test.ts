import assert from 'node:assert/strict'
import { test } from 'node:test'
import { toFtsMatchQuery } from '../src/lib/fts-query.ts'

test('terms are quoted and the last one matches as a prefix', () => {
  assert.equal(toFtsMatchQuery('cloudflare work'), '"cloudflare" "work"*')
  assert.equal(toFtsMatchQuery('d1'), '"d1"*')
})

test('FTS operators and syntax characters are matched as text', () => {
  assert.equal(toFtsMatchQuery('a OR b'), '"a" "OR" "b"*')
  assert.equal(toFtsMatchQuery('title:foo* NEAR(x)'), '"title:foo*" "NEAR(x)"*')
  assert.equal(toFtsMatchQuery('say "hi"'), '"say" "hi"*')
})

test('input with nothing searchable yields no query', () => {
  assert.equal(toFtsMatchQuery(''), null)
  assert.equal(toFtsMatchQuery('  "" ** - '), null)
})

test('non-latin words are kept', () => {
  assert.equal(toFtsMatchQuery('日本語'), '"日本語"*')
})

test('term count and length are capped', () => {
  const many = Array.from({ length: 20 }, (_, i) => `w${i}`).join(' ')
  assert.equal(toFtsMatchQuery(many)?.split(' ').length, 8)
  assert.equal(toFtsMatchQuery('x'.repeat(200)), `"${'x'.repeat(64)}"*`)
})
