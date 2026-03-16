import { createFileRoute, Link } from '@tanstack/react-router'
import { FileText, FolderOpen, Mail, PenLine, Rocket, Briefcase, Eye, TrendingUp, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getDashboardStats } from '@/server/functions/dashboard.functions'
import { getViewAnalytics } from '@/server/functions/views.functions'
import { getSubscriberStats } from '@/server/functions/subscribers.functions'

export const Route = createFileRoute('/admin/_layout/')({
  loader: async () => {
    const [stats, analytics, subscriberStats] = await Promise.all([
      getDashboardStats(),
      getViewAnalytics(),
      getSubscriberStats(),
    ])
    return { stats, analytics, subscriberStats }
  },
  component: DashboardPage,
})

function DashboardPage() {
  const { stats, analytics, subscriberStats } = Route.useLoaderData()

  return (
    <div className="space-y-8">
      <header className="border-b border-[var(--border-color)] pb-4 mb-6">
        <h1 className="text-2xl font-bold uppercase tracking-tight flex items-center gap-2">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Overview of your content and system metrics.
        </p>
      </header>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Total Posts"
          value={stats.totalPosts}
          icon={FileText}
          href="/admin/posts"
        />
        <StatCard
          label="Projects"
          value={stats.totalProjects}
          icon={FolderOpen}
          href="/admin/portfolio"
        />
        <StatCard
          label="Messages"
          value={stats.unreadContacts}
          icon={Mail}
          href="/admin/contacts"
          accent={stats.unreadContacts > 0}
        />
        <StatCard
          label="Drafts"
          value={stats.draftPosts}
          icon={PenLine}
          href="/admin/posts"
        />
        <StatCard
          label="Total Views"
          value={analytics.totalViews}
          icon={Eye}
          href="/admin/posts"
        />
        <StatCard
          label="Views (7d)"
          value={analytics.recentViews}
          icon={TrendingUp}
          href="/admin/posts"
          accent={analytics.recentViews > 0}
        />
        <StatCard
          label="Subscribers"
          value={subscriberStats.confirmed}
          icon={Users}
          href="/admin/subscribers"
          accent={subscriberStats.confirmed > 0}
        />
      </div>

      {/* Popular Posts */}
      {analytics.popularPosts.length > 0 && (
        <div className="pt-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-4">
            Popular Posts
          </h2>
          <div className="border border-[var(--border-color)] bg-[var(--bg-secondary)] divide-y divide-[var(--border-color)]">
            {analytics.popularPosts.map((post, i) => (
              <Link
                key={post.postId}
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[var(--bg-primary)]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-[var(--border-color)] bg-[var(--bg-primary)] font-mono text-sm font-bold text-[var(--text-secondary)] group-hover:border-[var(--accent)] group-hover:text-[var(--accent)]">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--text-primary)]">
                  {post.title}
                </span>
                <span className="flex shrink-0 items-center gap-1.5 font-mono text-xs text-[var(--text-secondary)]">
                  <Eye className="h-3.5 w-3.5" />
                  {post.views.toLocaleString()}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="pt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-4">
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <QuickLink
            label="New Post"
            description="Create a new blog article"
            icon={FileText}
            to="/admin/posts/new"
          />
          <QuickLink
            label="New Project"
            description="Add an item to your portfolio"
            icon={FolderOpen}
            to="/admin/portfolio/new"
          />
          <QuickLink
            label="New SaaS"
            description="Register a new product"
            icon={Rocket}
            to="/admin/saas/new"
          />
          <QuickLink
            label="Resume"
            description="Update your resume"
            icon={Briefcase}
            to="/admin/resume"
          />
          <QuickLink
            label="Messages"
            description={`${stats.unreadContacts} unread messages`}
            icon={Mail}
            to="/admin/contacts"
          />
          <QuickLink
            label="Subscribers"
            description={`${subscriberStats.confirmed} confirmed subscribers`}
            icon={Users}
            to="/admin/subscribers"
          />
        </div>
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
        'group block border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5 transition-colors hover:border-[var(--accent)] hover:bg-[var(--bg-primary)]',
        accent && 'border-[var(--accent)] bg-[var(--accent)]/5'
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
          {label}
        </span>
        <Icon
          className={cn(
            'h-5 w-5',
            accent ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--accent)]'
          )}
        />
      </div>
      <p className={cn(
        "mt-4 text-3xl font-bold",
        accent ? "text-[var(--accent)]" : "text-[var(--text-primary)]"
      )}>
        {value}
      </p>
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
      className="group flex items-center gap-4 border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 transition-colors hover:border-[var(--accent)] hover:bg-[var(--bg-primary)]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--border-color)] bg-[var(--bg-primary)] group-hover:border-[var(--accent)] transition-colors">
        <Icon className="h-4 w-4 text-[var(--text-secondary)] group-hover:text-[var(--accent)]" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)] truncate">
          {label}
        </p>
        <p className="mt-0.5 text-xs text-[var(--text-secondary)] truncate">
          {description}
        </p>
      </div>
    </Link>
  )
}
