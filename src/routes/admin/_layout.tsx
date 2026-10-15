import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import {
  Terminal,
  LayoutDashboard,
  FileText,
  FolderOpen,
  Rocket,
  Briefcase,
  Mail,
  Webhook,
  Users,
  Palette,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { getCurrentUser, logout } from '@/server/functions/auth.functions'

import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { ArrowUpRight } from 'lucide-react'
import '@/components/admin/admin.css'
import { Button, FieldError } from '@/components/ui'

export const Route = createFileRoute('/admin/_layout')({
  beforeLoad: async () => {
    const user = await getCurrentUser()
    if (!user) {
      throw redirect({ to: '/admin/login' })
    }
    return { user }
  },
  component: AdminLayout,
})

const sidebarItems = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Posts', to: '/admin/posts', icon: FileText },
  { label: 'Portfolio', to: '/admin/portfolio', icon: FolderOpen },
  { label: 'SaaS', to: '/admin/saas', icon: Rocket },
  { label: 'Resume', to: '/admin/resume', icon: Briefcase },
  { label: 'Contacts', to: '/admin/contacts', icon: Mail },
  { label: 'Webhooks', to: '/admin/webhooks', icon: Webhook },
  { label: 'Subscribers', to: '/admin/subscribers', icon: Users },
  { label: 'Design system', to: '/admin/design-system', icon: Palette },
] as const

function AdminLayout() {
  const { user } = Route.useRouteContext()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const logoutFn = useServerFn(logout)
  const logoutMutation = useMutation({ mutationFn: () => logoutFn() })
  return (
    <div className="admin-workspace">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <Link to="/admin">
            <Terminal size={22} aria-hidden="true" />
            <span>
              adryanev.com<strong>Content studio</strong>
            </span>
          </Link>
          <Button
            variant="plain"
            className="admin-menu-toggle"
            aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={sidebarOpen}
            aria-controls="admin-navigation"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </Button>
        </div>
        <nav
          id="admin-navigation"
          className="admin-navigation"
          data-open={sidebarOpen}
          aria-label="Content management"
        >
          {sidebarItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className="admin-navigation__link"
              activeProps={{ className: 'admin-navigation__link is-active' }}
              activeOptions={{ exact: item.to === '/admin' }}
            >
              <item.icon size={18} aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar__account" data-open={sidebarOpen}>
          <p title={user.email}>{user.email}</p>
          <div className="admin-sidebar__tools">
            <Link to="/">View website</Link>
            <ThemeToggle />
          </div>
          <Button
            variant="secondary"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut size={16} />
            {logoutMutation.isPending ? 'Signing out…' : 'Sign out'}
          </Button>
          {logoutMutation.isError && (
            <FieldError role="alert">
              Sign out failed. Please try again.
            </FieldError>
          )}
        </div>
      </aside>
      <main id="main-content" className="admin-main">
        <div className="admin-topbar">
          <span>Content studio</span>
          <Link to="/portfolio">
            View public work <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
