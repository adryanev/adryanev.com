import { Feed } from 'feed'
import { eq, and, isNull, desc } from 'drizzle-orm'
import { db } from '@/db'
import { posts } from '@/db/schema/posts'

const SITE_URL = process.env.SITE_URL || 'https://adryanev.com'

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
  })

  for (const post of publishedPosts) {
    feed.addItem({
      title: post.title,
      id: `${SITE_URL}/blog/${post.slug}`,
      link: `${SITE_URL}/blog/${post.slug}`,
      description: post.excerpt ?? post.content.slice(0, 300),
      content: post.content,
      date: post.publishedAt ?? post.createdAt,
    })
  }

  return feed.rss2()
}
