import { Link } from '@tanstack/react-router'
import { Menu } from 'lucide-react'
import { useState } from 'react'
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
    <header className="sticky top-0 z-40 w-full border-b-2 border-text-primary dark:border-border bg-bg-primary/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link
          to="/"
          className="group flex items-center gap-3 font-mono text-xl font-bold uppercase tracking-widest text-text-primary"
        >
          <span className="flex h-10 w-10 items-center justify-center bg-accent text-accent-fg brutal-border transition-transform group-hover:rotate-12">
            <span aria-hidden="true">A</span>
            <span className="sr-only">Adryan Eka Vandra</span>
          </span>
          <span className="hidden sm:inline-block">adryanev<span className="text-accent animate-pulse motion-reduce:animate-none">_</span></span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group relative font-sans text-sm font-semibold text-text-secondary transition-colors hover:text-text-primary"
              activeProps={{
                className: '!text-accent !font-bold',
              }}
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-[6px] left-0 h-[3px] w-full bg-accent" />
                  )}
                  {!isActive && (
                    <span className="absolute -bottom-[6px] left-0 h-[2px] w-0 bg-text-primary transition-all duration-300 group-hover:w-full" />
                  )}
                </>
              )}
            </Link>
          ))}
          <div className="ml-4 border-l border-border pl-6 flex items-center">
            <ThemeToggle />
          </div>
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center gap-4 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-11 w-11 items-center justify-center brutal-border bg-bg-secondary text-text-primary transition-colors hover:bg-accent hover:text-accent-fg active:scale-95"
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
