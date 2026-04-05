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
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { getCurrentUser, logout } from '@/server/functions/auth.functions'

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
] as const

function AdminLayout() {
  const { user } = Route.useRouteContext()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const logoutFn = useServerFn(logout)
  const logoutMutation = useMutation({
    mutationFn: () => logoutFn(),
  })

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)] font-mono selection:bg-[var(--accent)] selection:text-[var(--accent-fg)]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[var(--bg-primary)]/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[var(--border-color)] bg-[var(--bg-secondary)] transition-transform duration-200 md:static md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        {...(sidebarOpen ? { role: 'dialog', 'aria-modal': true } : {})}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between border-b border-[var(--border-color)] px-4">
          <Link
            to="/admin"
            className="flex items-center gap-2 text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
          >
            <Terminal className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-widest">Admin</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {sidebarItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 text-sm transition-colors border-l-2 border-transparent hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] text-[var(--text-secondary)]',
              )}
              activeProps={{
                className: 'border-[var(--accent)] bg-[var(--bg-primary)] text-[var(--text-primary)] font-semibold',
              }}
              activeOptions={{ exact: item.to === '/admin' }}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-[var(--border-color)] p-4 bg-[var(--bg-primary)]">
          <div className="mb-3 truncate text-xs text-[var(--text-secondary)] flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
            {user.email}
          </div>
          <button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="flex w-full items-center gap-2 border border-[var(--border-color)] px-3 py-2 text-sm transition-colors hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 text-[var(--text-secondary)]"
          >
            <LogOut className="h-4 w-4" />
            {logoutMutation.isPending ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        
        {/* Mobile header */}
        <div className="flex h-16 items-center border-b border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 md:hidden relative z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent hover:border-[var(--border-color)] transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="ml-3 text-sm font-bold uppercase tracking-widest text-[var(--text-primary)]">
            Admin
          </span>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
