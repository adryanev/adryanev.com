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
import { searchContent } from '@/server/functions/search.functions'

const NAV_ITEMS = [
  { label: 'Home', to: '/', icon: Home, keywords: 'home start landing' },
  { label: 'About', to: '/about', icon: User, keywords: 'about bio info' },
  { label: 'Resume', to: '/resume', icon: Briefcase, keywords: 'resume cv experience' },
  { label: 'Portfolio', to: '/portfolio', icon: FolderOpen, keywords: 'portfolio projects work' },
  { label: 'Blog', to: '/blog', icon: Newspaper, keywords: 'blog posts articles' },
  { label: 'SaaS', to: '/saas', icon: Rocket, keywords: 'saas products apps' },
  { label: 'Contact', to: '/contact', icon: Mail, keywords: 'contact email message' },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{
    posts: { id: number; title: string; slug: string }[]
    projects: { id: number; title: string; slug: string; category: { slug: string } }[]
  }>({ posts: [], projects: [] })
  const navigate = useNavigate()
  const { setTheme } = useTheme()
  const searchFn = useServerFn(searchContent)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  const inputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Lock body scroll and focus input when open
  useEffect(() => {
    if (open) {
      const locks = Number(document.body.dataset.scrollLocks || 0)
      document.body.dataset.scrollLocks = String(locks + 1)
      document.body.style.overflow = 'hidden'
      requestAnimationFrame(() => inputRef.current?.focus())
      return () => {
        const remaining = Number(document.body.dataset.scrollLocks || 0) - 1
        document.body.dataset.scrollLocks = String(remaining)
        if (remaining <= 0) document.body.style.overflow = ''
      }
    }
  }, [open])

  // Debounced search
  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (value.trim().length < 2) {
        setResults({ posts: [], projects: [] })
        return
      }
      debounceRef.current = setTimeout(async () => {
        const data = await searchFn({ data: { query: value } })
        setResults(data)
      }, 300)
    },
    [searchFn],
  )

  const go = (to: string) => {
    setOpen(false)
    setQuery('')
    navigate({ to })
  }

  const handleSetTheme = (theme: 'light' | 'dark' | 'system') => {
    setTheme(theme)
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-text-primary/60 backdrop-blur-[2px]"
        onClick={() => setOpen(false)}
      />
      <div className="relative w-full max-w-xl px-4 animate-in fade-in zoom-in-95 duration-200">
        <Command
          className="brutal-border brutal-shadow-lg bg-bg-primary overflow-hidden flex flex-col overscroll-contain"
          shouldFilter={true}
        >
          <div className="flex items-center border-b-2 border-text-primary px-4 bg-bg-secondary">
            <Search className="h-5 w-5 text-text-secondary mr-3" />
            <Command.Input
              ref={inputRef}
              value={query}
              onValueChange={handleSearch}
              placeholder="Search pages, posts, projects…"
              aria-label="Search"
              className="w-full py-5 font-sans text-base text-text-primary outline-none placeholder:text-text-secondary bg-transparent"
            />
          </div>

          <Command.List className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin">
            <Command.Empty className="px-6 py-12 text-center">
              <p className="font-serif text-2xl italic text-text-primary mb-2">No results</p>
              <p className="font-mono text-xs text-text-secondary">Try a different search term</p>
            </Command.Empty>

            {/* Navigation */}
            <Command.Group
              heading="Pages"
              className="px-4 pt-4 pb-2 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-accent"
            >
              {NAV_ITEMS.map((item) => (
                <Command.Item
                  key={item.to}
                  value={`${item.label} ${item.keywords}`}
                  onSelect={() => go(item.to)}
                  className="flex cursor-pointer items-center gap-4 border-2 border-transparent px-4 py-3 font-serif text-xl font-bold text-text-primary transition-colors aria-selected:border-text-primary aria-selected:bg-bg-secondary aria-selected:italic aria-selected:text-accent"
                >
                  <item.icon className="h-5 w-5 shrink-0 text-text-secondary" />
                  {item.label}
                </Command.Item>
              ))}
            </Command.Group>

            {/* Blog search results */}
            {results.posts.length > 0 && (
              <Command.Group
                heading="Blog Posts"
                className="px-4 pt-6 pb-2 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-accent"
              >
                {results.posts.map((post) => (
                  <Command.Item
                    key={`post-${post.id}`}
                    value={post.title}
                    onSelect={() => go(`/blog/${post.slug}`)}
                    className="flex cursor-pointer items-center gap-4 border-2 border-transparent px-4 py-3 font-serif text-xl font-bold text-text-primary transition-colors aria-selected:border-text-primary aria-selected:bg-bg-secondary aria-selected:italic aria-selected:text-accent"
                  >
                    <FileText className="h-5 w-5 shrink-0 text-text-secondary" />
                    {post.title}
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Project search results */}
            {results.projects.length > 0 && (
              <Command.Group
                heading="Projects"
                className="px-4 pt-6 pb-2 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-accent"
              >
                {results.projects.map((project) => (
                  <Command.Item
                    key={`project-${project.id}`}
                    value={project.title}
                    onSelect={() =>
                      go(`/portfolio/${project.category.slug}/${project.slug}`)
                    }
                    className="flex cursor-pointer items-center gap-4 border-2 border-transparent px-4 py-3 font-serif text-xl font-bold text-text-primary transition-colors aria-selected:border-text-primary aria-selected:bg-bg-secondary aria-selected:italic aria-selected:text-accent"
                  >
                    <FolderOpen className="h-5 w-5 shrink-0 text-text-secondary" />
                    {project.title}
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Theme */}
            <Command.Group
              heading="Theme"
              className="px-4 pt-6 pb-2 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-accent"
            >
              {[
                { label: 'Light', theme: 'light', icon: Sun },
                { label: 'Dark', theme: 'dark', icon: Moon },
                { label: 'System', theme: 'system', icon: Monitor },
              ].map((t) => (
                <Command.Item
                  key={t.theme}
                  value={`${t.label} theme`}
                  onSelect={() => handleSetTheme(t.theme as any)}
                  className="flex cursor-pointer items-center gap-4 border-2 border-transparent px-4 py-3 font-serif text-xl font-bold text-text-primary transition-colors aria-selected:border-text-primary aria-selected:bg-bg-secondary aria-selected:italic aria-selected:text-accent"
                >
                  <t.icon className="h-5 w-5 shrink-0 text-text-secondary" />
                  {t.label}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>

          <div className="border-t-2 border-text-primary bg-bg-secondary px-6 py-3 flex items-center justify-between font-mono text-[10px] font-bold text-text-secondary tracking-wider">
            <div className="flex gap-4">
              <span>
                <kbd className="brutal-border bg-bg-primary px-1.5 py-0.5 mr-1 text-text-primary">↑↓</kbd> Navigate
              </span>
              <span>
                <kbd className="brutal-border bg-bg-primary px-1.5 py-0.5 mr-1 text-text-primary">↵</kbd> Select
              </span>
            </div>
            <span>
              <kbd className="brutal-border bg-bg-primary px-1.5 py-0.5 mr-1 text-text-primary">Esc</kbd> Close
            </span>
          </div>
        </Command>
      </div>
    </div>
  )
}
