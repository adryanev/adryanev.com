import { createFileRoute, Link } from '@tanstack/react-router'
import { FileText, FolderOpen, Mail, PenLine, Rocket, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getDashboardStats } from '@/server/functions/dashboard.functions'

export const Route = createFileRoute('/admin/_layout/')({
  loader: () => getDashboardStats(),
  component: DashboardPage,
})

function DashboardPage() {
  const stats = Route.useLoaderData()

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Overview of your content
      </p>

      {/* Stats grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Posts"
          value={stats.totalPosts}
          icon={FileText}
          href="/admin/posts"
        />
        <StatCard
          label="Total Projects"
          value={stats.totalProjects}
          icon={FolderOpen}
          href="/admin/portfolio"
        />
        <StatCard
          label="Unread Messages"
          value={stats.unreadContacts}
          icon={Mail}
          href="/admin/contacts"
          accent={stats.unreadContacts > 0}
        />
        <StatCard
          label="Draft Posts"
          value={stats.draftPosts}
          icon={PenLine}
          href="/admin/posts"
        />
      </div>

      {/* Quick links */}
      <h2 className="mt-10 text-lg font-semibold">Quick Actions</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink
          label="New Blog Post"
          description="Write a new article"
          icon={FileText}
          to="/admin/posts/new"
        />
        <QuickLink
          label="New Project"
          description="Add a portfolio project"
          icon={FolderOpen}
          to="/admin/portfolio/new"
        />
        <QuickLink
          label="New SaaS Listing"
          description="Showcase a product"
          icon={Rocket}
          to="/admin/saas/new"
        />
        <QuickLink
          label="Manage Resume"
          description="Update resume entries"
          icon={Briefcase}
          to="/admin/resume"
        />
        <QuickLink
          label="View Messages"
          description={`${stats.unreadContacts} unread`}
          icon={Mail}
          to="/admin/contacts"
        />
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  href,
  accent,
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  href: string
  accent?: boolean
}) {
  return (
    <Link
      to={href}
      className={cn(
        'rounded-lg border p-5 transition-colors',
        'border-slate-200 bg-white hover:border-slate-300',
        'dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700',
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <Icon
          className={cn(
            'h-5 w-5',
            accent
              ? 'text-accent'
              : 'text-slate-400 dark:text-slate-500',
          )}
        />
      </div>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </Link>
  )
}

function QuickLink({
  label,
  description,
  icon: Icon,
  to,
}: {
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  to: string
}) {
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-4 rounded-lg border p-4 transition-colors',
        'border-slate-200 bg-white hover:border-accent/50',
        'dark:border-slate-800 dark:bg-slate-900 dark:hover:border-accent/50',
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/10">
        <Icon className="h-5 w-5 text-accent" />
      </div>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
    </Link>
  )
}
