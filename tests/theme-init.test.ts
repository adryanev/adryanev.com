import assert from 'node:assert/strict'
import { test } from 'node:test'
import { setTheme, themeInitScript } from '../src/lib/theme'

function installBrowser(systemPrefersDark: boolean) {
  const storage = new Map<string, string>()
  const classes = new Set<string>()
  const classList = {
    add: (name: string) => classes.add(name),
    toggle: (name: string, on: boolean) => (on ? classes.add(name) : classes.delete(name)),
  }
  Object.assign(globalThis, {
    window: { matchMedia: () => ({ matches: systemPrefersDark }) },
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    },
    document: { documentElement: { classList } },
  })
  return { classes }
}

function firstPaintIsDark(systemPrefersDark: boolean, chosen?: 'light' | 'dark' | 'system') {
  const { classes } = installBrowser(systemPrefersDark)
  if (chosen) setTheme(chosen)
  classes.clear()
  new Function(themeInitScript)()
  return classes.has('dark')
}

test('first paint honours a light theme chosen on a dark system', () => {
  assert.equal(firstPaintIsDark(true, 'light'), false)
})

test('first paint honours a dark theme chosen on a light system', () => {
  assert.equal(firstPaintIsDark(false, 'dark'), true)
})

test('first paint follows the system when nothing or system was chosen', () => {
  assert.equal(firstPaintIsDark(true), true)
  assert.equal(firstPaintIsDark(false), false)
  assert.equal(firstPaintIsDark(true, 'system'), true)
})
