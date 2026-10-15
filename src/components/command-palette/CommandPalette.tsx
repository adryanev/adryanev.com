import { Command } from 'cmdk'
import { useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Home,
  User,
  Briefcase,
  FolderOpen,
  Newspaper,
  Rocket,
  Mail,
  FileText,
  Sun,
  Moon,
  Monitor,
  Search,
} from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { useScrollLock } from '@/hooks/useScrollLock'
import { searchContent } from '@/server/functions/search.functions'

import { useDialogFocus } from '@/hooks/useDialogFocus'
import { X } from 'lucide-react'
import { Button, Feedback, FieldError } from '@/components/ui'

const NAV_ITEMS = [
  { label: 'Home', to: '/', icon: Home, keywords: 'home start landing' },
  { label: 'About', to: '/about', icon: User, keywords: 'about bio info' },
  {
    label: 'Resume',
    to: '/resume',
    icon: Briefcase,
    keywords: 'resume cv experience',
  },
  {
    label: 'Portfolio',
    to: '/portfolio',
    icon: FolderOpen,
    keywords: 'portfolio projects work',
  },
  {
    label: 'Blog',
    to: '/blog',
    icon: Newspaper,
    keywords: 'blog posts articles',
  },
  { label: 'SaaS', to: '/saas', icon: Rocket, keywords: 'saas products apps' },
  {
    label: 'Contact',
    to: '/contact',
    icon: Mail,
    keywords: 'contact email message',
  },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{
    posts: { id: number; title: string; slug: string }[]
    projects: {
      id: number
      title: string
      slug: string
      category: { slug: string }
    }[]
  }>({ posts: [], projects: [] })
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const navigate = useNavigate()
  const { setTheme } = useTheme()
  const searchFn = useServerFn(searchContent)
  const dialogRef = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useScrollLock(open)
  useDialogFocus(open, dialogRef, close)

  useEffect(() => {
    const toggle = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        window.dispatchEvent(new Event('site:close-terminal'))
        setOpen((value) => !value)
      }
    }
    const show = () => {
      window.dispatchEvent(new Event('site:close-terminal'))
      setOpen(true)
    }
    document.addEventListener('keydown', toggle)
    window.addEventListener('site:search', show)
    window.addEventListener('site:close-search', close)
    return () => {
      document.removeEventListener('keydown', toggle)
      window.removeEventListener('site:search', show)
      window.removeEventListener('site:close-search', close)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setResults({ posts: [], projects: [] })
    if (!open || query.trim().length < 2) {
      setStatus('idle')
      return
    }
    setStatus('loading')
    const timer = setTimeout(() => {
      searchFn({ data: { query: query.trim() } })
        .then((data) => {
          if (!cancelled) {
            setResults(data)
            setStatus('idle')
          }
        })
        .catch(() => {
          if (!cancelled) setStatus('error')
        })
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query, open, searchFn])

  const go = (to: string) => {
    close()
    setQuery('')
    void navigate({ to })
  }
  const term = query.trim().toLowerCase()
  const pages = NAV_ITEMS.filter((item) =>
    (item.label + ' ' + item.keywords).toLowerCase().includes(term),
  )
  const themes = [
    { label: 'Light', theme: 'light', icon: Sun },
    { label: 'Dark', theme: 'dark', icon: Moon },
    { label: 'System', theme: 'system', icon: Monitor },
  ] as const
  const visibleThemes = themes.filter((item) =>
    (item.label + ' theme').toLowerCase().includes(term),
  )
  if (!open) return null
  return (
    <div className="chapter-search fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4">
      <div className="fixed inset-0 bg-text-primary/60" onClick={close} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search website"
        className="relative w-full max-w-xl"
      >
        <Command
          shouldFilter={false}
          className="border-2 border-text-primary bg-bg-secondary flex flex-col overflow-hidden"
        >
          <div className="flex items-center gap-3 border-b-2 border-text-primary px-4">
            <Search size={20} aria-hidden="true" />
            <Command.Input
              data-dialog-autofocus
              value={query}
              onValueChange={setQuery}
              aria-label="Search pages, articles and projects"
              placeholder="Search pages, articles, projects…"
              className="w-full min-w-0 py-5 bg-transparent text-base outline-none"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={close}
              aria-label="Close search"
            >
              <X size={20} />
            </Button>
          </div>
          {status === 'loading' && (
            <Feedback tone="info" role="status">
              Searching content…
            </Feedback>
          )}
          {status === 'error' && (
            <FieldError role="alert">
              Search could not load. Change the search term to try again. Page
              links still work.
            </FieldError>
          )}
          <Command.List className="max-h-[55dvh] overflow-y-auto p-2">
            {status === 'idle' &&
              !pages.length &&
              !visibleThemes.length &&
              !results.posts.length &&
              !results.projects.length && (
                <Command.Empty className="p-6 text-center">
                  No results. Try another title or topic.
                </Command.Empty>
              )}
            {!!pages.length && (
              <Command.Group heading="Pages" className="p-3">
                {pages.map((item) => (
                  <Command.Item
                    key={item.to}
                    value={item.to}
                    onSelect={() => go(item.to)}
                    className="flex cursor-pointer items-center gap-3 px-3 py-2"
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Command.Item>
                ))}
              </Command.Group>
            )}
            {!!results.posts.length && (
              <Command.Group heading="Articles" className="p-3">
                {results.posts.map((post) => (
                  <Command.Item
                    key={post.id}
                    value={'post-' + post.id}
                    onSelect={() => go('/blog/' + post.slug)}
                    className="flex cursor-pointer items-center gap-3 px-3 py-2"
                  >
                    <FileText size={18} />
                    {post.title}
                  </Command.Item>
                ))}
              </Command.Group>
            )}
            {!!results.projects.length && (
              <Command.Group heading="Projects" className="p-3">
                {results.projects.map((project) => (
                  <Command.Item
                    key={project.id}
                    value={'project-' + project.id}
                    onSelect={() =>
                      go(
                        '/portfolio/' +
                          project.category.slug +
                          '/' +
                          project.slug,
                      )
                    }
                    className="flex cursor-pointer items-center gap-3 px-3 py-2"
                  >
                    <FolderOpen size={18} />
                    {project.title}
                  </Command.Item>
                ))}
              </Command.Group>
            )}
            {!!visibleThemes.length && (
              <Command.Group heading="Appearance" className="p-3">
                {visibleThemes.map((item) => (
                  <Command.Item
                    key={item.theme}
                    value={'theme-' + item.theme}
                    onSelect={() => {
                      setTheme(item.theme)
                      close()
                    }}
                    className="flex cursor-pointer items-center gap-3 px-3 py-2"
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
          <p className="border-t border-border px-5 py-3 text-xs text-text-secondary">
            Arrow keys to navigate · Enter to open · Esc to close
          </p>
        </Command>
      </div>
    </div>
  )
}
