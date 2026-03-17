import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { Calendar, Clock, ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { getPublishedPostBySlug } from '@/server/functions/public.functions'
import { seoMeta, canonicalLink, articleJsonLd, breadcrumbJsonLd, jsonLdScript } from '@/lib/seo'

const SITE_URL = process.env.SITE_URL || 'https://adryanev.com'

export const Route = createFileRoute('/blog/$slug')({
  loader: async ({ params }) => {
    const post = await getPublishedPostBySlug({ data: { slug: params.slug } })
    if (!post) throw notFound()
    return post
  },
  component: BlogPostPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-4xl px-6 py-20 text-center">
      <p className="font-mono text-6xl font-bold text-accent">404</p>
      <p className="mt-4 font-sans text-lg text-text-secondary">Post not found</p>
      <Link
        to="/blog"
        search={{ page: undefined, tag: undefined }}
        className="mt-6 inline-block font-mono text-sm font-bold text-accent hover:underline"
      >
        Back to blog
      </Link>
    </div>
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

function BlogPostPage() {
  const post = Route.useLoaderData()
  const contentRef = useRef<HTMLDivElement>(null)

  // Inject copy buttons into code blocks
  useEffect(() => {
    const el = contentRef.current
    if (!el) return

    const pres = el.querySelectorAll<HTMLPreElement>('pre.shiki')
    const buttons: HTMLButtonElement[] = []

    pres.forEach((pre) => {
      const btn = document.createElement('button')
      btn.className = 'code-copy-btn'
      btn.textContent = 'Copy'
      btn.addEventListener('click', () => {
        const code = pre.querySelector('code')
        if (!code) return
        const text = code.innerText
        navigator.clipboard.writeText(text).then(() => {
          btn.textContent = 'Copied!'
          btn.dataset.copied = 'true'
          setTimeout(() => {
            btn.textContent = 'Copy'
            delete btn.dataset.copied
          }, 2000)
        })
      })
      pre.appendChild(btn)
      buttons.push(btn)
    })

    return () => { buttons.forEach((b) => b.remove()) }
  }, [post.html])

  // Client-side mermaid rendering
  useEffect(() => {
    const el = contentRef.current
    if (!el) return

    const mermaidBlocks = el.querySelectorAll<HTMLElement>('[data-mermaid]')
    if (mermaidBlocks.length === 0) return

    let cancelled = false
    import('mermaid').then(({ default: mermaid }) => {
      if (cancelled) return
      mermaid.initialize({
        startOnLoad: false,
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
        fontFamily: 'JetBrains Mono, monospace',
      })

      mermaidBlocks.forEach(async (block, i) => {
        if (cancelled) return

        const source = block.textContent ?? ''
        const id = `mermaid-${post.slug}-${i}`

        try {
          const { svg } = await mermaid.render(id, source)
          block.className = 'mermaid-diagram my-8 flex justify-center overflow-x-auto'
          block.removeAttribute('data-mermaid')
          block.innerHTML = svg
        } catch {
          // Leave as-is if rendering fails — shows raw source
        }
      })
    })

    return () => { cancelled = true }
  }, [post.slug])

  return (
    <article className="mx-auto max-w-3xl px-6 py-12 md:py-24">
      <Link
        to="/blog"
        search={{ page: undefined, tag: undefined }}
        className="inline-flex items-center gap-2 font-mono text-sm font-bold text-text-secondary hover:text-accent transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to blog
      </Link>

      {post.coverImage && (
        <img
          src={post.coverImage}
          alt={post.title}
          loading="eager"
          fetchPriority="high"
          className="mt-8 w-full brutal-border object-cover"
        />
      )}

      <h1 className="mt-8 font-serif text-4xl font-bold leading-tight text-text-primary md:text-6xl">
        {post.title}
      </h1>

      <div className="mt-6 flex items-center gap-6 font-mono text-sm text-text-secondary">
        {post.publishedAt && (
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-accent" />
            {new Date(post.publishedAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        )}
        <span className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-accent" />
          {post.readingTime} min read
        </span>
      </div>

      {post.postsToTags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {post.postsToTags.map((pt) => (
            <Link
              key={pt.tag.id}
              to="/blog"
              search={{ page: undefined, tag: pt.tag.slug }}
              className="bg-bg-secondary px-3 py-1 font-mono text-xs uppercase tracking-widest text-text-primary border border-border hover:text-accent hover:border-accent transition-colors"
            >
              {pt.tag.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-10 mb-4 border-t-2 border-text-primary" />

      {/* Rendered markdown content */}
      <div
        ref={contentRef}
        className={cn(
          'prose dark:prose-invert max-w-none',
          'prose-headings:font-serif prose-headings:font-bold prose-headings:text-text-primary',
          'prose-p:font-sans prose-p:text-text-secondary prose-p:leading-relaxed',
          'prose-a:text-accent prose-a:underline prose-a:decoration-accent/40 prose-a:underline-offset-2 hover:prose-a:decoration-accent',
          'prose-strong:text-text-primary prose-strong:font-bold',
          'prose-blockquote:border-accent prose-blockquote:text-text-secondary prose-blockquote:font-serif prose-blockquote:italic',
          'prose-code:rounded prose-code:bg-bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-mono prose-code:text-accent prose-code:before:content-none prose-code:after:content-none',
          'prose-pre:brutal-border prose-pre:rounded-none prose-pre:overflow-x-auto',
          'prose-img:brutal-border prose-img:rounded-none',
          'prose-hr:border-border',
          'prose-li:text-text-secondary prose-li:font-sans',
          'prose-th:font-mono prose-th:text-text-primary prose-td:text-text-secondary',
          'prose-table:brutal-border',
        )}
        dangerouslySetInnerHTML={{ __html: post.html }}
      />

      {/* Prev/Next navigation */}
      <div className="mt-16 grid grid-cols-2 gap-6 border-t-2 border-text-primary dark:border-border pt-8">
        {post.prev ? (
          <Link
            to="/blog/$slug"
            params={{ slug: post.prev.slug }}
            className="group flex items-center gap-3 font-sans text-sm text-text-secondary hover:text-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-1" />
            <span className="line-clamp-2">{post.prev.title}</span>
          </Link>
        ) : (
          <div />
        )}
        {post.next ? (
          <Link
            to="/blog/$slug"
            params={{ slug: post.next.slug }}
            className="group flex items-center justify-end gap-3 text-right font-sans text-sm text-text-secondary hover:text-accent transition-colors"
          >
            <span className="line-clamp-2">{post.next.title}</span>
            <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </article>
  )
}
