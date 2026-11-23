import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildViewKey, isCountableUserAgent, msUntilEndOfUtcDay } from '../src/lib/view-visitor'

const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

test('normal browser user-agent is countable', () => {
  assert.equal(isCountableUserAgent(BROWSER_UA), true)
})

test('empty, blank, and missing user-agents are not countable', () => {
  assert.equal(isCountableUserAgent(''), false)
  assert.equal(isCountableUserAgent('   '), false)
  assert.equal(isCountableUserAgent(null), false)
  assert.equal(isCountableUserAgent(undefined), false)
})

test('crawlers, preview fetchers, headless browsers, and scripts are not countable', () => {
  const automated = [
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Mozilla/5.0 (compatible; AhrefsBot/7.0)',
    'Mozilla/5.0 (Windows NT 10.0) HeadlessChrome/126.0.0.0 Safari/537.36',
    'facebookexternalhit/1.1',
    'Slackbot-LinkExpanding 1.0',
    'curl/8.4.0',
    'python-requests/2.31.0',
  ]
  for (const ua of automated) assert.equal(isCountableUserAgent(ua), false, ua)
})

test('view key is stable for the same post, IP, and user-agent', async () => {
  assert.equal(await buildViewKey(7, '203.0.113.9', BROWSER_UA), await buildViewKey(7, '203.0.113.9', BROWSER_UA))
})

test('view key differs across posts, IPs, and user-agents', async () => {
  const base = await buildViewKey(7, '203.0.113.9', BROWSER_UA)
  assert.notEqual(base, await buildViewKey(8, '203.0.113.9', BROWSER_UA))
  assert.notEqual(base, await buildViewKey(7, '203.0.113.10', BROWSER_UA))
  assert.notEqual(base, await buildViewKey(7, '203.0.113.9', 'Mozilla/5.0 other'))
})

test('view key contains a SHA-256 hex digest and no raw IP or user-agent', async () => {
  const key = await buildViewKey(7, '203.0.113.9', BROWSER_UA)
  assert.match(key, /^view:7:[0-9a-f]{64}$/)
  assert.equal(key.includes('203.0.113.9'), false)
})

test('window runs to the next UTC midnight', () => {
  assert.equal(msUntilEndOfUtcDay(new Date('2026-10-14T23:59:59Z')), 1000)
  assert.equal(msUntilEndOfUtcDay(new Date('2026-10-14T00:00:00Z')), 24 * 60 * 60 * 1000)
  assert.equal(msUntilEndOfUtcDay(new Date('2026-10-14T12:00:00+07:00')), 19 * 60 * 60 * 1000)
})
