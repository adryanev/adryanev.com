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
import { cn } from '@/lib/utils'
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
  const searchFn = useServerFn(searchContent)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

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

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    if (theme === 'system') {
      localStorage.removeItem('theme')
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', isDark)
    } else {
      localStorage.setItem('theme', theme)
      document.documentElement.classList.toggle('dark', theme === 'dark')
    }
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div className="fixed left-1/2 top-[20%] w-full max-w-lg -translate-x-1/2">
        <Command
          className={cn(
            'rounded-xl border shadow-2xl',
            'border-slate-200 bg-white',
            'dark:border-slate-700 dark:bg-slate-900',
          )}
          shouldFilter={true}
        >
          <Command.Input
            value={query}
            onValueChange={handleSearch}
            placeholder="Search pages, posts, projects..."
            className={cn(
              'w-full border-b px-4 py-3 text-sm outline-none',
              'border-slate-200 bg-transparent placeholder:text-slate-400',
              'dark:border-slate-700 dark:placeholder:text-slate-500',
            )}
          />
          <Command.List
            className="max-h-80 overflow-y-auto p-2"
          >
            <Command.Empty className="px-4 py-8 text-center text-sm text-slate-500">
              No results found.
            </Command.Empty>

            {/* Navigation */}
            <Command.Group heading="Navigation" className="px-2 py-1 text-xs font-medium text-slate-400">
              {NAV_ITEMS.map((item) => (
                <Command.Item
                  key={item.to}
                  value={`${item.label} ${item.keywords}`}
                  onSelect={() => go(item.to)}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm',
                    'aria-selected:bg-accent/10 aria-selected:text-accent',
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Command.Item>
              ))}
            </Command.Group>

            {/* Blog search results */}
            {results.posts.length > 0 && (
              <Command.Group heading="Blog Posts" className="px-2 py-1 text-xs font-medium text-slate-400">
                {results.posts.map((post) => (
                  <Command.Item
                    key={`post-${post.id}`}
                    value={post.title}
                    onSelect={() => go(`/blog/${post.slug}`)}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm',
                      'aria-selected:bg-accent/10 aria-selected:text-accent',
                    )}
                  >
                    <FileText className="h-4 w-4 shrink-0" />
                    {post.title}
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Project search results */}
            {results.projects.length > 0 && (
              <Command.Group heading="Projects" className="px-2 py-1 text-xs font-medium text-slate-400">
                {results.projects.map((project) => (
                  <Command.Item
                    key={`project-${project.id}`}
                    value={project.title}
                    onSelect={() =>
                      go(`/portfolio/${project.category.slug}/${project.slug}`)
                    }
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm',
                      'aria-selected:bg-accent/10 aria-selected:text-accent',
                    )}
                  >
                    <FolderOpen className="h-4 w-4 shrink-0" />
                    {project.title}
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Theme */}
            <Command.Group heading="Theme" className="px-2 py-1 text-xs font-medium text-slate-400">
              <Command.Item
                value="light theme"
                onSelect={() => setTheme('light')}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm',
                  'aria-selected:bg-accent/10 aria-selected:text-accent',
                )}
              >
                <Sun className="h-4 w-4 shrink-0" /> Light
              </Command.Item>
              <Command.Item
                value="dark theme"
                onSelect={() => setTheme('dark')}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm',
                  'aria-selected:bg-accent/10 aria-selected:text-accent',
                )}
              >
                <Moon className="h-4 w-4 shrink-0" /> Dark
              </Command.Item>
              <Command.Item
                value="system theme auto"
                onSelect={() => setTheme('system')}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm',
                  'aria-selected:bg-accent/10 aria-selected:text-accent',
                )}
              >
                <Monitor className="h-4 w-4 shrink-0" /> System
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div className="border-t border-slate-200 px-4 py-2 text-xs text-slate-400 dark:border-slate-700">
            <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono dark:bg-slate-800">
              ↑↓
            </kbd>{' '}
            navigate{' '}
            <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono dark:bg-slate-800">
              ↵
            </kbd>{' '}
            select{' '}
            <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono dark:bg-slate-800">
              esc
            </kbd>{' '}
            close
          </div>
        </Command>
      </div>
    </div>
  )
}
