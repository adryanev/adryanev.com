export type Theme = 'light' | 'dark' | 'system'

const THEME_KEY = 'theme:v1'

export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored
    }
  } catch { /* private browsing or storage unavailable */ }
  return 'system'
}

export function applyTheme(theme: Theme) {
  const resolved = theme === 'system' ? getSystemTheme() : theme
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

export function setTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch { /* quota exceeded or private browsing */ }
  applyTheme(theme)
}

export function isSystemTheme(): boolean {
  try {
    return localStorage.getItem(THEME_KEY) === 'system'
      || !localStorage.getItem(THEME_KEY)
  } catch { /* private browsing or storage unavailable */ }
  return true
}
