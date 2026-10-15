import { Link } from '@tanstack/react-router'
import { ArrowRight, ChevronRight, Eye, FilePlus2, FileText, FolderOpen, FolderPlus, Mail, Rocket, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { getDashboardStats } from '@/server/functions/dashboard.functions'
import type { getViewAnalytics } from '@/server/functions/views.functions'
import type { getSubscriberStats } from '@/server/functions/subscribers.functions'
import './dashboard.css'

type DashboardData = {
  stats: Awaited<ReturnType<typeof getDashboardStats>>
  analytics: Awaited<ReturnType<typeof getViewAnalytics>>
  subscriberStats: Awaited<ReturnType<typeof getSubscriberStats>>
}

export function DashboardOverview({ stats, analytics, subscriberStats }: DashboardData) {
  const number = (value: number) => value.toLocaleString('en-US')
  const latestDraft = stats.latestDraft

  return (
    <div className="dashboard-overview">
      <header className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Your content and readership, in one place.</p>
        </div>
        <div className="dashboard-header__actions">
          <Link to="/admin/posts/new" className="admin-action"><FilePlus2 size={20} aria-hidden="true" />New post</Link>
          <Link to="/admin/portfolio/new" className="admin-action admin-action--secondary"><FolderPlus size={20} aria-hidden="true" />New project</Link>
        </div>
      </header>

      <div className="dashboard-columns">
        <section className="dashboard-content" aria-labelledby="dashboard-content-title">
          <div className="dashboard-section-heading">
            <h2 id="dashboard-content-title">Content</h2>
            <p>Manage your content, projects, and products.</p>
          </div>
          <div className="dashboard-collections">
            <CollectionRow to="/admin/posts" icon={FileText} label="Posts" description="Blog articles and notes" count={stats.totalPosts} />
            <CollectionRow to="/admin/portfolio" icon={FolderOpen} label="Projects" description="Portfolio entries and case studies" count={stats.totalProjects} />
            <CollectionRow to="/admin/saas" icon={Rocket} label="Products" description="SaaS products and tools" count={stats.totalProducts} />
          </div>

          <section className="dashboard-attention" aria-labelledby="dashboard-attention-title">
            <div className="dashboard-section-heading">
              <h2 id="dashboard-attention-title">Needs attention</h2>
              <p>Pick up where you left off.</p>
            </div>
            <Link
              to={latestDraft ? '/admin/posts/$id/edit' : '/admin/posts/new'}
              params={latestDraft ? { id: String(latestDraft.id) } : undefined}
              className="dashboard-attention__row"
            >
              <span className="dashboard-attention__icon"><FileText size={20} aria-hidden="true" /></span>
              <span className="dashboard-attention__copy">
                <strong>{stats.draftPosts > 0 ? `${number(stats.draftPosts)} ${stats.draftPosts === 1 ? 'draft' : 'drafts'} to continue` : 'No drafts to continue'}</strong>
                <span>{latestDraft?.title ?? 'Start a new article when you are ready.'}</span>
              </span>
              <ChevronRight size={18} aria-hidden="true" />
            </Link>
            <Link to="/admin/contacts" className="dashboard-attention__row" data-unread={stats.unreadContacts > 0}>
              <span className="dashboard-attention__icon"><Mail size={20} aria-hidden="true" /></span>
              <span className="dashboard-attention__copy">
                <strong>{stats.unreadContacts > 0 ? `${number(stats.unreadContacts)} unread ${stats.unreadContacts === 1 ? 'message' : 'messages'}` : 'Inbox up to date'}</strong>
                <span>{stats.unreadContacts > 0 ? 'Open your unread messages.' : 'You can still browse saved messages.'}</span>
              </span>
              <ChevronRight size={18} aria-hidden="true" />
            </Link>
          </section>
        </section>

        <section className="dashboard-readership" aria-labelledby="dashboard-readership-title">
          <div className="dashboard-section-heading">
            <h2 id="dashboard-readership-title">Readership</h2>
            <p>Article views and people following your updates.</p>
          </div>
          <dl className="dashboard-view-totals">
            <div className="dashboard-view-totals__recent">
              <dt><Eye size={24} aria-hidden="true" /><span>Views <span className="dashboard-view-totals__period">(last 7 days)</span></span></dt>
              <dd>{number(analytics.recentViews)}</dd>
            </div>
            <div>
              <dt><Eye size={16} aria-hidden="true" />All-time views</dt>
              <dd>{number(analytics.totalViews)}</dd>
            </div>
          </dl>

          <section className="dashboard-popular" aria-labelledby="dashboard-popular-title">
            <div className="dashboard-section-heading dashboard-section-heading--link">
              <div><h2 id="dashboard-popular-title">Popular articles</h2><p>Your most viewed published articles.</p></div>
              <Link to="/admin/posts">View all posts <ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
            {analytics.popularPosts.length > 0 ? (
              <ol className="dashboard-popular__list">
                {analytics.popularPosts.map((post, index) => (
                  <li key={post.postId}>
                    <Link to="/blog/$slug" params={{ slug: post.slug }}>
                      <span className="dashboard-popular__rank" aria-hidden="true">{index + 1}</span>
                      <span className="dashboard-popular__title">{post.title}</span>
                      <span className="dashboard-popular__views"><Eye size={15} aria-hidden="true" />{number(post.views)}<span className="sr-only"> {post.views === 1 ? 'view' : 'views'}</span></span>
                      <ChevronRight size={16} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="dashboard-empty"><p>No article views yet.</p><p>Published articles appear here as readers open them.</p><Link to="/admin/posts">Manage articles <ArrowRight size={16} aria-hidden="true" /></Link></div>
            )}
          </section>

          <section className="dashboard-subscribers" aria-labelledby="dashboard-subscribers-title">
            <div className="dashboard-section-heading"><h2 id="dashboard-subscribers-title">Subscribers</h2><p>People who have confirmed their subscription.</p></div>
            <div className="dashboard-subscribers__summary">
              <Users size={24} aria-hidden="true" />
              <p><strong>{number(subscriberStats.confirmed)}</strong><span>Confirmed subscribers{subscriberStats.pending > 0 && <small>{number(subscriberStats.pending)} awaiting confirmation.</small>}</span></p>
              <Link to="/admin/subscribers" search={{ page: 1 }}>Manage subscribers <ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
          </section>
        </section>
      </div>

      <nav className="dashboard-workspace-links" aria-label="More workspace tools">
        <Link to="/admin/resume">Resume</Link>
        <Link to="/admin/portfolio/categories">Categories</Link>
        <Link to="/admin/webhooks">Webhooks</Link>
        <span>adryanev.com <span aria-hidden="true">/</span> Content studio</span>
      </nav>
    </div>
  )
}

function CollectionRow({ to, icon: Icon, label, description, count }: { to: string, icon: LucideIcon, label: string, description: string, count: number }) {
  return <Link to={to} className="dashboard-collection">
    <Icon size={27} aria-hidden="true" />
    <span><strong>{label}</strong><span>{description}</span></span>
    <span className="dashboard-collection__count">{count.toLocaleString('en-US')}</span>
    <ChevronRight size={18} aria-hidden="true" />
  </Link>
}

export function DashboardPending() {
  return <div className="dashboard-overview dashboard-pending" role="status" aria-busy="true">
    <header className="dashboard-header"><div><h1>Dashboard</h1><p>Loading your content and readership…</p></div></header>
    <div className="dashboard-columns" aria-hidden="true"><div className="dashboard-pending__column" /><div className="dashboard-pending__column" /></div>
  </div>
}
