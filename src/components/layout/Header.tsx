import { Link } from '@tanstack/react-router'
import { Menu, Search } from 'lucide-react'
import { useState } from 'react'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { MobileNav } from './MobileNav'

const navItems = [
  { label: 'About', to: '/about' },
  { label: 'Resume', to: '/resume' },
  { label: 'Work', to: '/portfolio' },
  { label: 'Writing', to: '/blog' },
  { label: 'Products', to: '/saas' },
  { label: 'Contact', to: '/contact' },
] as const

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="site-masthead">
        <Link to="/" className="site-masthead__brand">
          <span>adryanev.com</span>
          <small>Software engineer</small>
        </Link>

        <nav className="site-masthead__nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="site-masthead__link"
              activeProps={{ className: 'site-masthead__link is-active' }}
            >
              {item.label}
            </Link>
          ))}
          <div className="site-masthead__theme">
            <button className="site-search-toggle" aria-label="Search website" onClick={() => window.dispatchEvent(new Event('site:search'))}><Search size={18} /></button>
            <ThemeToggle />
          </div>
        </nav>

        <div className="site-masthead__mobile">
          <button className="site-search-toggle" aria-label="Search website" onClick={() => window.dispatchEvent(new Event('site:search'))}><Search size={18} /></button>
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(true)}
            className="site-masthead__menu"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            <Menu aria-hidden="true" />
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
