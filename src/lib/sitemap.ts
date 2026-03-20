import { eq, and, isNull, desc, asc } from 'drizzle-orm'
import { db } from '@/db'
import { posts } from '@/db/schema/posts'
import { portfolioCategories, portfolioProjects } from '@/db/schema/portfolio'

const SITE_URL = process.env.SITE_URL || 'https://adryanev.com'

export async function generateSitemap(): Promise<string> {
  const [publishedPosts, categories, projects] = await Promise.all([
    db.query.posts.findMany({
      where: and(eq(posts.status, 'published'), isNull(posts.deletedAt)),
      orderBy: desc(posts.publishedAt),
      columns: { slug: true, updatedAt: true },
    }),
    db.query.portfolioCategories.findMany({
      orderBy: asc(portfolioCategories.sortOrder),
      columns: { slug: true },
    }),
    db.query.portfolioProjects.findMany({
      where: and(
        eq(portfolioProjects.status, 'published'),
        isNull(portfolioProjects.deletedAt),
      ),
      columns: { slug: true, updatedAt: true },
      with: { category: { columns: { slug: true } } },
    }),
  ])

  const urls: { loc: string; lastmod?: string; changefreq?: string; priority?: string }[] = [
    { loc: '/', changefreq: 'weekly', priority: '1.0' },
    { loc: '/about', changefreq: 'monthly', priority: '0.8' },
    { loc: '/blog', changefreq: 'weekly', priority: '0.9' },
    { loc: '/portfolio', changefreq: 'monthly', priority: '0.9' },
    { loc: '/resume', changefreq: 'monthly', priority: '0.7' },
    { loc: '/saas', changefreq: 'monthly', priority: '0.7' },
    { loc: '/contact', changefreq: 'yearly', priority: '0.6' },
  ]

  for (const post of publishedPosts) {
    urls.push({
      loc: `/blog/${post.slug}`,
      lastmod: post.updatedAt.toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: '0.8',
    })
  }

  for (const cat of categories) {
    urls.push({ loc: `/portfolio/${cat.slug}`, changefreq: 'monthly', priority: '0.7' })
  }

  for (const project of projects) {
    urls.push({
      loc: `/portfolio/${project.category.slug}/${project.slug}`,
      lastmod: project.updatedAt.toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: '0.6',
    })
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${SITE_URL}${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}${u.changefreq ? `\n    <changefreq>${u.changefreq}</changefreq>` : ''}${u.priority ? `\n    <priority>${u.priority}</priority>` : ''}
  </url>`,
  )
  .join('\n')}
</urlset>`

  return xml
}

export function generateRobotsTxt(): string {
  return `User-agent: *
Allow: /
Disallow: /admin/

Sitemap: ${SITE_URL}/sitemap.xml
`
}
