import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { getPublishedPosts, getAllTags } from '@/server/functions/public.functions'
import { getPostViewCounts } from '@/server/functions/views.functions'
import { seoMeta, canonicalLink } from '@/lib/seo'
import { SubscribeForm } from '@/components/newsletter/SubscribeForm'

export const Route = createFileRoute('/blog/')({
  validateSearch: (search: Record<string, unknown>) => ({
    page: search.page ? Number(search.page) : undefined,
    tag: (search.tag as string) || undefined,
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const page = deps.page ?? 1
    const [data, tags] = await Promise.all([
      getPublishedPosts({ data: { page, tag: deps.tag } }),
      getAllTags(),
    ])
    const postIds = data.posts.map((p) => p.id)
    const { views } = postIds.length > 0
      ? await getPostViewCounts({ data: { postIds } })
      : { views: {} as Record<number, number> }
    return { ...data, tags, currentTag: deps.tag, views }
  },
  component: BlogListPage,
  head: () => ({
    meta: seoMeta({
      title: 'Blog — Adryan Eka Vandra',
      description: 'Technical blog posts about software engineering, web development, and more.',
      path: '/blog',
    }),
    links: [canonicalLink('/blog')],
  }),
})

function BlogListPage() {
  const { posts, page, totalPages, tags, currentTag, views } = Route.useLoaderData()
  const navigate = Route.useNavigate()

  return (
    <div className="chapter-page chapter-blog mx-auto">
      <header className="chapter-header">
        <h1>Writing</h1>
        <p>Notes on engineering, design, and the work behind software.</p>
      </header>
      {tags.length > 0 && <nav className="topic-filters" aria-label="Filter articles by topic">
        <button aria-pressed={!currentTag} onClick={() => navigate({ search: { page: undefined, tag: undefined } })}>All articles</button>
        {tags.map((tag) => <button key={tag.id} aria-pressed={currentTag === tag.slug}
          onClick={() => navigate({ search: { page: undefined, tag: tag.slug } })}>{tag.name} <span>({tag.postCount})</span></button>)}
      </nav>}
      {posts.length === 0 ? <section className="page-empty">
        <h2>{currentTag ? 'No articles for this topic' : 'No articles published yet'}</h2>
        <p>{currentTag ? 'Choose another topic or browse all articles.' : 'New articles will appear here when they are published.'}</p>
        {currentTag && <button className="page-button page-button--quiet" onClick={() => navigate({ search: { page: undefined, tag: undefined } })}>Show all articles</button>}
      </section> : <div className="writing-index">
        {posts.map((post) => <article className="writing-entry" key={post.id}>
          <div className="writing-entry__meta">
            {post.publishedAt && <time dateTime={new Date(post.publishedAt).toISOString()}>
              {new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(post.publishedAt))}
            </time>}
            {(views as Record<number, number>)[post.id] > 0 && <span>{(views as Record<number, number>)[post.id].toLocaleString()} views</span>}
          </div>
          <h2><Link to="/blog/$slug" params={{ slug: post.slug }}>{post.title}</Link></h2>
          {post.excerpt && <p>{post.excerpt}</p>}
          <div className="writing-entry__topics">{post.postsToTags.map((pt) => <span key={pt.tag.id}>{pt.tag.name}</span>)}</div>
          <Link className="writing-entry__link" to="/blog/$slug" params={{ slug: post.slug }}>Read article <ArrowRight size={18} aria-hidden="true" /></Link>
        </article>)}
      </div>}
      {totalPages > 1 && <nav className="page-pagination" aria-label="Article pages">
        <button className="page-button page-button--quiet" disabled={page <= 1}
          onClick={() => navigate({ search: { page: page - 1, tag: currentTag ?? undefined } })}>Previous</button>
        <span aria-current="page">Page {page} of {totalPages}</span>
        <button className="page-button page-button--quiet" disabled={page >= totalPages}
          onClick={() => navigate({ search: { page: page + 1, tag: currentTag ?? undefined } })}>Next</button>
      </nav>}
      <SubscribeForm />
    </div>
  )
}
