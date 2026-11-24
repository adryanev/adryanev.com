import { Link } from '@tanstack/react-router'
import { Menu, Search } from 'lucide-react'
import { useState } from 'react'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { MobileNav } from './MobileNav'

import { Button } from '@/components/ui'
const pageItems = [
  { label: 'About', to: '/about' },
  { label: 'Resume', to: '/resume' },
  { label: 'Work', to: '/portfolio' },
  { label: 'Writing', to: '/blog' },
  { label: 'Products', to: '/saas' },
] as const

// The masthead sets Contact apart as its call to action
const contactItem = { label: 'Contact', to: '/contact' } as const

const navItems = [...pageItems, contactItem]

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
          {pageItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="site-masthead__link"
              activeProps={{ className: 'is-active' }}
            >
              {item.label}
            </Link>
          ))}
          <div className="site-masthead__theme">
            <Button
              variant="plain"
              className="site-search-toggle"
              aria-label="Search website"
              onClick={() => window.dispatchEvent(new Event('site:search'))}
            >
              <Search size={18} />
            </Button>
            <ThemeToggle />
          </div>
          <Link
            to={contactItem.to}
            className="site-masthead__link site-masthead__cta"
            activeProps={{ className: 'is-active' }}
          >
            {contactItem.label}
          </Link>
        </nav>

        <div className="site-masthead__mobile">
          <Button
            variant="plain"
            className="site-search-toggle"
            aria-label="Search website"
            onClick={() => window.dispatchEvent(new Event('site:search'))}
          >
            <Search size={18} />
          </Button>
          <ThemeToggle />
          <Button
            variant="plain"
            onClick={() => setMobileOpen(true)}
            className="site-masthead__menu"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            <Menu aria-hidden="true" />
          </Button>
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
