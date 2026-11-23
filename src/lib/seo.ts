export const SITE_URL = process.env.SITE_URL || 'https://adryanev.com'
const SITE_NAME = 'Adryan Eka Vandra'
const DEFAULT_OG_IMAGE_PATH = '/images/og-default.png'
const DEFAULT_OG_IMAGE_ALT = 'Adryan Eka Vandra, Software Engineer'
const DEFAULT_OG_IMAGE_SIZE = { width: 1200, height: 630 }
const DEFAULT_DESCRIPTION =
  'Personal website of Adryan Eka Vandra — Software Engineer. Portfolio, blog, resume, and active SaaS projects.'

interface SeoOptions {
  title: string
  description?: string
  path: string
  type?: 'website' | 'article'
  image?: string
  imageAlt?: string
  article?: {
    publishedTime?: string
    modifiedTime?: string
    tags?: string[]
  }
  noindex?: boolean
}

export function absoluteUrl(url: string): string {
  return url.startsWith('/') && !url.startsWith('//') ? `${SITE_URL}${url}` : url
}

const IMAGE_MIME_TYPES: Record<string, string> = {
  avif: 'image/avif',
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  webp: 'image/webp',
}

export function imageMimeType(url: string): string | undefined {
  const extension = url.split(/[?#]/)[0].split('.').pop()?.toLowerCase()
  return extension ? IMAGE_MIME_TYPES[extension] : undefined
}

export function seoMeta(opts: SeoOptions) {
  const description = opts.description ?? DEFAULT_DESCRIPTION
  const url = `${SITE_URL}${opts.path}`
  const type = opts.type ?? 'website'
  const usesDefaultImage = !opts.image
  const image = absoluteUrl(opts.image ?? DEFAULT_OG_IMAGE_PATH)
  const imageAlt = usesDefaultImage
    ? DEFAULT_OG_IMAGE_ALT
    : (opts.imageAlt ?? opts.title)

  const meta: Array<Record<string, string>> = [
    { title: opts.title },
    { name: 'description', content: description },
    // Open Graph
    { property: 'og:title', content: opts.title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:type', content: type },
    { property: 'og:locale', content: 'en_US' },
    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: opts.title },
    { name: 'twitter:description', content: description },
    { property: 'og:image', content: image },
    { property: 'og:image:alt', content: imageAlt },
    { name: 'twitter:image', content: image },
    { name: 'twitter:image:alt', content: imageAlt },
  ]

  // Dimensions are only known for the bundled image
  if (usesDefaultImage) {
    meta.push(
      { property: 'og:image:width', content: String(DEFAULT_OG_IMAGE_SIZE.width) },
      { property: 'og:image:height', content: String(DEFAULT_OG_IMAGE_SIZE.height) },
    )
  }

  if (opts.article) {
    if (opts.article.publishedTime) {
      meta.push({ property: 'article:published_time', content: opts.article.publishedTime })
    }
    if (opts.article.modifiedTime) {
      meta.push({ property: 'article:modified_time', content: opts.article.modifiedTime })
    }
    if (opts.article.tags) {
      for (const tag of opts.article.tags) {
        meta.push({ property: 'article:tag', content: tag })
      }
    }
    meta.push({ property: 'article:author', content: SITE_URL + '/about' })
  }

  if (opts.noindex) {
    meta.push({ name: 'robots', content: 'noindex, nofollow' })
  }

  return meta
}

export function canonicalLink(path: string) {
  return { rel: 'canonical', href: `${SITE_URL}${path}` }
}

// JSON-LD helpers

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    author: personData(),
  }
}

function personData() {
  return {
    '@type': 'Person',
    name: 'Adryan Eka Vandra',
    url: SITE_URL,
    jobTitle: 'Software Engineer',
    sameAs: [
      'https://github.com/adryanev',
      'https://linkedin.com/in/adryanev',
    ],
  }
}

export function personJsonLd() {
  return {
    '@context': 'https://schema.org',
    ...personData(),
  }
}

export function articleJsonLd(opts: {
  title: string
  description: string
  url: string
  image?: string
  publishedTime?: string
  modifiedTime?: string
  tags?: string[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    url: opts.url,
    image: absoluteUrl(opts.image ?? DEFAULT_OG_IMAGE_PATH),
    ...(opts.publishedTime && { datePublished: opts.publishedTime }),
    ...(opts.modifiedTime && { dateModified: opts.modifiedTime }),
    ...(opts.tags && { keywords: opts.tags.join(', ') }),
    author: personData(),
    publisher: personData(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': opts.url,
    },
  }
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  }
}

export function jsonLdScript(data: Record<string, unknown> | Array<Record<string, unknown>>) {
  return {
    type: 'application/ld+json',
    children: JSON.stringify(Array.isArray(data) ? data : [data]),
  }
}
