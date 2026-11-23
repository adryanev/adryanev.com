import { createFileRoute, notFound } from '@tanstack/react-router'
import {
  getPublishedPosts,
  getAllTags,
} from '@/server/functions/public.functions'
import { seoMeta, canonicalLink } from '@/lib/seo'
import { blogListPath, parsePage } from '@/lib/blog-paths'
import { SubscribeForm } from '@/components/newsletter/SubscribeForm'
import { PostListing } from '@/components/blog/PostListing'
import { PageHeader } from '@/components/ui'

export const Route = createFileRoute('/blog/tag/$tag')({
  validateSearch: (search: Record<string, unknown>): { page?: number } => ({
    page: parsePage(search.page),
  }),
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: async ({ params, deps }) => {
    const page = deps.page ?? 1
    const [data, tags] = await Promise.all([
      getPublishedPosts({ data: { page, tag: params.tag } }),
      getAllTags(),
    ])
    const tag = tags.find((candidate) => candidate.slug === params.tag)
    if (!tag || tag.postCount === 0) throw notFound()
    if (page > 1 && data.posts.length === 0) throw notFound()
    return { ...data, tags, tag }
  },
  component: TagPage,
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: 'Topic not found' }] }
    const { tag, page } = loaderData
    const path = blogListPath(tag.slug, page)
    const articleCount = `${tag.postCount} ${tag.postCount === 1 ? 'article' : 'articles'}`
    return {
      meta: seoMeta({
        title: `${tag.name}${page > 1 ? `, page ${page}` : ''} — Blog — Adryan Eka Vandra`,
        description: `${articleCount} by Adryan Eka Vandra about ${tag.name}.`,
        path,
      }),
      links: [canonicalLink(path)],
    }
  },
})

function TagPage() {
  const { posts, page, totalPages, tags, tag } = Route.useLoaderData()

  return (
    <div className="chapter-page chapter-blog mx-auto">
      <PageHeader variant="chapter">
        <h1>{tag.name}</h1>
        <p>
          {tag.postCount} {tag.postCount === 1 ? 'article' : 'articles'} on this
          topic.
        </p>
      </PageHeader>
      <PostListing
        posts={posts}
        page={page}
        totalPages={totalPages}
        tags={tags}
        currentTag={tag.slug}
      />
      <SubscribeForm />
    </div>
  )
}
