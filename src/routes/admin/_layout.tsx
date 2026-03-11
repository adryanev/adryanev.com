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
] as const

function AdminLayout() {
  const { user } = Route.useRouteContext()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const logoutFn = useServerFn(logout)
  const logoutMutation = useMutation({
    mutationFn: () => logoutFn(),
  })

  return (
    <div className="flex min-h-screen">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r transition-transform duration-200 md:static md:translate-x-0',
          'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
          <Link
            to="/admin"
            className="font-mono text-sm font-bold text-accent"
          >
            {'>'} admin_panel
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-md p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {sidebarItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                'dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
              )}
              activeProps={{
                className: 'bg-accent/10 text-accent dark:text-accent',
              }}
              activeOptions={{ exact: item.to === '/admin' }}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          <div className="mb-2 truncate px-3 text-xs text-slate-500 dark:text-slate-400">
            {user.email}
          </div>
          <button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className={cn(
              'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              'text-slate-600 hover:bg-red-50 hover:text-red-600',
              'dark:text-slate-400 dark:hover:bg-red-950 dark:hover:text-red-400',
            )}
          >
            <LogOut className="h-4 w-4" />
            {logoutMutation.isPending ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <div className="flex h-16 items-center border-b border-slate-200 px-4 dark:border-slate-800 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="ml-3 font-mono text-sm font-bold text-accent">
            admin
          </span>
        </div>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
