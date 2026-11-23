import { createFileRoute, notFound, redirect } from '@tanstack/react-router'
import {
  getPublishedPosts,
  getAllTags,
} from '@/server/functions/public.functions'
import { seoMeta, canonicalLink } from '@/lib/seo'
import { blogListPath, parsePage } from '@/lib/blog-paths'
import { SubscribeForm } from '@/components/newsletter/SubscribeForm'
import { PostListing } from '@/components/blog/PostListing'

import { PageHeader } from '@/components/ui'
export const Route = createFileRoute('/blog/')({
  validateSearch: (
    search: Record<string, unknown>,
  ): { page?: number; tag?: string } => ({
    page: parsePage(search.page),
    tag: typeof search.tag === 'string' && search.tag ? search.tag : undefined,
  }),
  beforeLoad: ({ search }) => {
    if (search.tag) {
      throw redirect({
        to: '/blog/tag/$tag',
        params: { tag: search.tag },
        search: { page: search.page },
        statusCode: 301,
      })
    }
  },
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: async ({ deps }) => {
    const page = deps.page ?? 1
    const [data, tags] = await Promise.all([
      getPublishedPosts({ data: { page } }),
      getAllTags(),
    ])
    if (page > 1 && data.posts.length === 0) throw notFound()
    return { ...data, tags }
  },
  component: BlogListPage,
  head: ({ loaderData }) => {
    const page = loaderData?.page ?? 1
    const path = blogListPath(undefined, page)
    return {
      meta: seoMeta({
        title: `${page > 1 ? `Blog, page ${page}` : 'Blog'} — Adryan Eka Vandra`,
        description:
          'Technical blog posts about software engineering, web development, and more.',
        path,
      }),
      links: [canonicalLink(path)],
    }
  },
})

function BlogListPage() {
  const { posts, page, totalPages, tags } = Route.useLoaderData()

  return (
    <div className="chapter-page chapter-blog mx-auto">
      <PageHeader variant="chapter">
        <h1>Writing</h1>
        <p>Notes on engineering, design, and the work behind software.</p>
      </PageHeader>
      <PostListing
        posts={posts}
        page={page}
        totalPages={totalPages}
        tags={tags}
      />
      <SubscribeForm />
    </div>
  )
}
