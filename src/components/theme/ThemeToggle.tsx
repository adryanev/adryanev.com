import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'

export function ThemeToggle() {
  const { theme, cycleTheme } = useTheme()

  const Icon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor

  return (
    <button
      onClick={cycleTheme}
      className="group flex h-11 w-11 items-center justify-center brutal-border bg-bg-secondary text-text-primary transition-colors hover:text-accent hover:border-accent"
      aria-label={`Theme: ${theme}. Click to change.`}
      title={`Theme: ${theme}`}
    >
      <Icon className="h-5 w-5 transition-transform group-hover:rotate-12" />
    </button>
  )
}
