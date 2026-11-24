import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  getPublishedPostBySlug,
  getRelatedPosts,
} from '@/server/functions/public.functions'
import {
  seoMeta,
  canonicalLink,
  articleJsonLd,
  breadcrumbJsonLd,
  jsonLdScript,
  SITE_URL,
} from '@/lib/seo'
import { recordPostView } from '@/server/functions/views.functions'
import { SubscribeForm } from '@/components/newsletter/SubscribeForm'
import { TableOfContentsLayout } from '@/components/blog/TableOfContents'
import { RelatedPosts } from '@/components/blog/RelatedPosts'
import { PostBody } from '@/components/blog/PostBody'
import { PostArticleIntro } from '@/components/blog/PostArticleIntro'
import '@/components/blog/article.css'

import { Button, PageState } from '@/components/ui'
export const Route = createFileRoute('/blog/$slug')({
  loader: async ({ params }) => {
    const [post, related] = await Promise.all([
      getPublishedPostBySlug({ data: { slug: params.slug } }),
      getRelatedPosts({ data: { slug: params.slug } }),
    ])
    if (!post) throw notFound()
    return { ...post, related }
  },
  component: BlogPostPage,
  notFoundComponent: () => (
    <PageState className="text-center">
      <h1 className="text-4xl font-bold">Article not found</h1>
      <p className="mt-4 font-sans text-lg text-text-secondary">
        Post not found
      </p>
      <Button asChild variant="secondary" size="lg">
        <Link
          to="/blog"
          search={{ page: undefined, tag: undefined }}
          className="mt-6"
        >
          Back to blog
        </Link>
      </Button>
    </PageState>
  ),
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: 'Post Not Found' }] }
    }
    const path = `/blog/${loaderData.slug}`
    return {
      meta: seoMeta({
        title: `${loaderData.title} — Adryan Eka Vandra`,
        description: loaderData.excerpt ?? '',
        path,
        type: 'article',
        image: loaderData.coverImage ?? undefined,
        article: {
          publishedTime: loaderData.publishedAt
            ? new Date(loaderData.publishedAt).toISOString()
            : undefined,
          modifiedTime: loaderData.updatedAt
            ? new Date(loaderData.updatedAt).toISOString()
            : undefined,
          tags: loaderData.postsToTags.map((pt) => pt.tag.name),
        },
      }),
      links: [canonicalLink(path)],
      scripts: [
        jsonLdScript([
          articleJsonLd({
            title: loaderData.title,
            description: loaderData.excerpt ?? '',
            url: `${SITE_URL}${path}`,
            image: loaderData.coverImage ?? undefined,
            publishedTime: loaderData.publishedAt
              ? new Date(loaderData.publishedAt).toISOString()
              : undefined,
            modifiedTime: loaderData.updatedAt
              ? new Date(loaderData.updatedAt).toISOString()
              : undefined,
            tags: loaderData.postsToTags.map((pt) => pt.tag.name),
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
            { name: loaderData.title, path },
          ]),
        ]),
      ],
    }
  },
})

function useRecordedViewCount(postId: number): number | null {
  const [viewCount, setViewCount] = useState<number | null>(null)

  // The response carries the updated total
  useEffect(() => {
    let cancelled = false
    recordPostView({ data: { postId } })
      .then((result) => {
        if (!cancelled) setViewCount(result.views)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [postId])

  return viewCount
}

function BlogPostPage() {
  const post = Route.useLoaderData()
  const viewCount = useRecordedViewCount(post.id)

  return (
    <article className="chapter-page post-article">
      <Link
        to="/blog"
        search={{ page: undefined, tag: undefined }}
        className="post-article__back"
      >
        <ArrowLeft aria-hidden="true" /> Back to writing
      </Link>

      <PostArticleIntro
        title={post.title}
        excerpt={post.excerpt}
        publishedAt={post.publishedAt}
        updatedAt={post.updatedAt}
        readingTime={post.readingTime}
        viewCount={viewCount}
        tags={post.postsToTags.map((pt) => pt.tag)}
        coverImage={post.coverImage}
      />

      <TableOfContentsLayout headings={post.headings}>
        <PostBody content={post.content} />
      </TableOfContentsLayout>

      <div className="post-article__end">
        <SubscribeForm />
        <RelatedPosts posts={post.related} />
        {(post.prev || post.next) && (
          <nav className="post-article__pager" aria-label="More articles">
            {post.prev && (
              <Link to="/blog/$slug" params={{ slug: post.prev.slug }}>
                <small>Older</small>
                <b>{post.prev.title}</b>
              </Link>
            )}
            {post.next && (
              <Link
                to="/blog/$slug"
                params={{ slug: post.next.slug }}
                className="post-article__pager-next"
              >
                <small>Newer</small>
                <b>{post.next.title}</b>
              </Link>
            )}
          </nav>
        )}
      </div>
    </article>
  )
}
