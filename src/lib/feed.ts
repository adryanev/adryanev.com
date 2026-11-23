import { Feed } from 'feed'
import { eq, and, isNull, desc } from 'drizzle-orm'
import { db } from '@/db'
import { posts } from '@/db/schema/posts'
import { renderEditorJs, extractText, type OutputData } from '@/lib/editorjs-renderer'

import { absoluteUrl, imageMimeType } from '@/lib/seo'

const SITE_URL = process.env.SITE_URL || 'https://adryanev.com'

// RSS enclosures need a MIME type; skip covers whose type cannot be told from the URL
function coverEnclosure(coverImage: string | null) {
  if (!coverImage) return undefined
  const url = absoluteUrl(coverImage)
  const type = imageMimeType(url)
  return type ? { url, type } : undefined
}

export async function generateRssFeed(): Promise<string> {
  const feed = new Feed({
    title: 'Adryan Eka Vandra',
    description: 'Blog posts about software engineering, web development, and more.',
    id: SITE_URL,
    link: SITE_URL,
    language: 'en',
    copyright: `All rights reserved ${new Date().getFullYear()}, Adryan Eka Vandra`,
    author: {
      name: 'Adryan Eka Vandra',
      email: 'me@adryanev.com',
      link: SITE_URL,
    },
  })

  const publishedPosts = await db.query.posts.findMany({
    where: and(eq(posts.status, 'published'), isNull(posts.deletedAt)),
    orderBy: desc(posts.publishedAt),
    limit: 20,
    with: { postsToTags: { with: { tag: true } } },
  })

  for (const post of publishedPosts) {
    let html = ''
    let text = ''
    try {
      const parsed = JSON.parse(post.content) as OutputData
      html = await renderEditorJs(parsed)
      text = extractText(parsed)
    } catch { /* keep html/text as empty strings */ }
    feed.addItem({
      title: post.title,
      id: `${SITE_URL}/blog/${post.slug}`,
      link: `${SITE_URL}/blog/${post.slug}`,
      description: post.excerpt ?? text.slice(0, 300),
      content: html,
      date: post.publishedAt ?? post.createdAt,
      category: post.postsToTags.map((pt) => ({ name: pt.tag.name })),
      image: coverEnclosure(post.coverImage),
    })
  }

  return feed.rss2()
}
