import { useCallback, useEffect, useState } from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'

type Theme = 'light' | 'dark' | 'system'

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function applyTheme(theme: Theme) {
  const resolved = theme === 'system' ? getSystemTheme() : theme
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system')

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null
    const initial = stored ?? 'system'
    setTheme(initial)
    applyTheme(initial)

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (localStorage.getItem('theme') === 'system' || !localStorage.getItem('theme')) {
        applyTheme('system')
      }
    }
    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [])

  const cycle = useCallback(() => {
    const order: Theme[] = ['dark', 'light', 'system']
    const next = order[(order.indexOf(theme) + 1) % order.length]
    setTheme(next)
    localStorage.setItem('theme', next)
    applyTheme(next)
  }, [theme])

  const Icon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor

  return (
    <button
      onClick={cycle}
      className={cn(
        'rounded-md p-2 transition-colors',
        'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
        'dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800',
      )}
      aria-label={`Theme: ${theme}. Click to change.`}
      title={`Theme: ${theme}`}
    >
      <Icon className="h-5 w-5" />
    </button>
  )
}
