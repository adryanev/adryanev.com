import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Rocket,
  Briefcase,
  Mail,
  Webhook,
  Users,
  Palette,
  Globe,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { getCurrentUser, logout } from '@/server/functions/auth.functions'
import { getAdminNavCounts } from '@/server/functions/dashboard.functions'

import { ThemeToggle } from '@/components/theme/ThemeToggle'
import '@/components/admin/admin.css'
import { Button, FieldError } from '@/components/ui'
import { AdminMotion } from '@/components/admin/motion'

export const Route = createFileRoute('/admin/_layout')({
  beforeLoad: async () => {
    const user = await getCurrentUser()
    if (!user) {
      throw redirect({ to: '/admin/login' })
    }
    return { user }
  },
  loader: () => getAdminNavCounts(),
  component: AdminLayout,
})

type NavCounts = Awaited<ReturnType<typeof getAdminNavCounts>>

type NavItem = {
  label: string
  to: string
  icon: LucideIcon
  exact?: boolean
  count?: (counts: NavCounts) => { value: string; unread?: boolean }
}

const total = (value: number) => ({ value: String(value) })

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Content',
    items: [
      { label: 'Posts', to: '/admin/posts', icon: FileText, count: (c) => total(c.posts) },
      { label: 'Portfolio', to: '/admin/portfolio', icon: FolderOpen, count: (c) => total(c.projects) },
      { label: 'Products', to: '/admin/saas', icon: Rocket, count: (c) => total(c.products) },
      { label: 'Resume', to: '/admin/resume', icon: Briefcase, count: (c) => total(c.resume) },
    ],
  },
  {
    label: 'Audience',
    items: [
      {
        label: 'Messages',
        to: '/admin/contacts',
        icon: Mail,
        count: (c) =>
          c.unreadMessages > 0
            ? { value: `${c.unreadMessages} new`, unread: true }
            : total(c.messages),
      },
      { label: 'Subscribers', to: '/admin/subscribers', icon: Users, count: (c) => total(c.subscribers) },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Webhooks', to: '/admin/webhooks', icon: Webhook, count: (c) => total(c.webhooks) },
      { label: 'Design system', to: '/admin/design-system', icon: Palette },
      { label: 'View site', to: '/', icon: Globe, exact: true },
    ],
  },
]

function AdminLayout() {
  const { user } = Route.useRouteContext()
  const counts = Route.useLoaderData()
  const [navOpen, setNavOpen] = useState(false)
  const logoutFn = useServerFn(logout)
  const logoutMutation = useMutation({ mutationFn: () => logoutFn() })
  const closeNav = () => setNavOpen(false)

  return (
    <div className="admin-workspace">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <Link to="/admin" onClick={closeNav}>
            <i aria-hidden="true" />
            Content studio
          </Link>
          <Button
            variant="plain"
            className="admin-menu-toggle"
            aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={navOpen}
            aria-controls="admin-navigation"
            onClick={() => setNavOpen(!navOpen)}
          >
            {navOpen ? <X size={18} /> : <Menu size={18} />}
          </Button>
        </div>
        <nav
          id="admin-navigation"
          className="admin-tree"
          data-open={navOpen}
          aria-label="Content management"
        >
          <TreeLink
            item={{ label: 'Overview', to: '/admin', icon: LayoutDashboard, exact: true }}
            counts={counts}
            onNavigate={closeNav}
          />
          {navGroups.map((group) => (
            <div key={group.label} role="group" aria-labelledby={'nav-' + group.label}>
              <p id={'nav-' + group.label} className="admin-tree__group">
                {group.label}
              </p>
              {group.items.map((item) => (
                <TreeLink
                  key={item.to}
                  item={item}
                  counts={counts}
                  onNavigate={closeNav}
                />
              ))}
            </div>
          ))}
        </nav>
        <div className="admin-sidebar__account" data-open={navOpen}>
          <span className="admin-sidebar__avatar" aria-hidden="true">
            {user.email.slice(0, 1).toUpperCase()}
          </span>
          <p title={user.email}>{user.email}</p>
          <ThemeToggle />
          <Button
            variant="plain"
            className="admin-sidebar__logout"
            aria-label="Sign out"
            title="Sign out"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut size={16} aria-hidden="true" />
          </Button>
          {logoutMutation.isError && (
            <FieldError role="alert">
              Sign out failed. Please try again.
            </FieldError>
          )}
        </div>
      </aside>
      <main id="main-content" className="admin-main">
        <AdminMotion>
          <Outlet />
        </AdminMotion>
      </main>
    </div>
  )
}

function TreeLink({
  item,
  counts,
  onNavigate,
}: {
  item: NavItem
  counts: NavCounts
  onNavigate: () => void
}) {
  const count = item.count?.(counts)
  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      className="admin-tree__link"
      activeProps={{ className: 'admin-tree__link is-active', 'aria-current': 'page' }}
      activeOptions={{ exact: item.exact ?? false }}
    >
      <item.icon size={16} aria-hidden="true" />
      {item.label}
      {count && (
        <span className="admin-tree__count" data-unread={count.unread || undefined}>
          {count.value}
        </span>
      )}
    </Link>
  )
}
