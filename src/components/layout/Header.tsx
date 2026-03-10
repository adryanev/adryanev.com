import { Link } from '@tanstack/react-router'
import { Menu } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { MobileNav } from './MobileNav'

const navItems = [
  { label: 'About', to: '/about' },
  { label: 'Resume', to: '/resume' },
  { label: 'Portfolio', to: '/portfolio' },
  { label: 'Blog', to: '/blog' },
  { label: 'SaaS', to: '/saas' },
  { label: 'Contact', to: '/contact' },
] as const

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b backdrop-blur-sm',
        'border-slate-200 bg-white/80',
        'dark:border-slate-800 dark:bg-slate-950/80',
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="font-mono text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100"
        >
          <span className="text-accent">{'>'}</span> adryanev
          <span className="animate-pulse text-accent">_</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
                'dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800',
              )}
              activeProps={{
                className: 'text-accent dark:text-accent bg-accent/10',
              }}
            >
              {item.label}
            </Link>
          ))}
          <div className="ml-2 border-l border-slate-200 pl-2 dark:border-slate-800">
            <ThemeToggle />
          </div>
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(true)}
            className={cn(
              'rounded-md p-2 transition-colors',
              'text-slate-600 hover:bg-slate-100',
              'dark:text-slate-400 dark:hover:bg-slate-800',
            )}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        items={navItems}
      />
    </header>
  )
}
