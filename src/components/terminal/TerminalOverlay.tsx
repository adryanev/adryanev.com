import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const HELP_TEXT = `Available commands:
  help      - Show this help message
  whoami    - Display info about me
  ls        - List items in current directory
  cd <path> - Navigate to a page (e.g., cd blog)
  cat <file>- Show content of a file
  pwd       - Print current path
  open <url>- Open an external link
  clear     - Clear the terminal
  history   - Show command history`

const WHOAMI = `Adryan Eka Vandra
Role: Software Engineer
Location: Indonesia
GitHub: github.com/adryanev
Email: hello@adryanev.com`

const FILE_SYSTEM: Record<string, { type: 'dir' | 'file'; children?: string[]; content?: string }> = {
  '/': { type: 'dir', children: ['about.md', 'resume/', 'blog/', 'portfolio/', 'saas/', 'contact.md'] },
  '/about.md': { type: 'file', content: 'Software Engineer based in Indonesia.\nBuilding web and mobile applications with a focus on clean architecture.' },
  '/resume/': { type: 'dir', children: ['experience/', 'education/', 'skills/'] },
  '/blog/': { type: 'dir', children: ['(posts loaded from database)'] },
  '/portfolio/': { type: 'dir', children: ['college/', 'freelance/', 'work/', 'apple-developer-academy/', 'lexicon/'] },
  '/saas/': { type: 'dir', children: ['(SaaS products loaded from database)'] },
  '/contact.md': { type: 'file', content: 'Want to get in touch?\nVisit /contact or email hello@adryanev.com' },
}

const PATH_MAP: Record<string, string> = {
  '/': '/',
  '/about.md': '/about',
  '/resume/': '/resume',
  '/blog/': '/blog',
  '/portfolio/': '/portfolio',
  '/portfolio/college/': '/portfolio/college',
  '/portfolio/freelance/': '/portfolio/freelance',
  '/portfolio/work/': '/portfolio/work',
  '/saas/': '/saas',
  '/contact.md': '/contact',
}

type Line = { type: 'input' | 'output'; text: string }

export function TerminalOverlay() {
  const [open, setOpen] = useState(false)
  const [lines, setLines] = useState<Line[]>([
    { type: 'output', text: 'Welcome to adryanev.com terminal. Type "help" for commands.' },
  ])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const [cwd, setCwd] = useState('/')
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  // Toggle with Ctrl+`
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight)
  }, [lines])

  const addLine = useCallback((type: 'input' | 'output', text: string) => {
    setLines((prev) => [...prev, { type, text }])
  }, [])

  const exec = useCallback(
    (cmd: string) => {
      const trimmed = cmd.trim()
      if (!trimmed) return

      addLine('input', `${cwd} $ ${trimmed}`)
      setHistory((prev) => [...prev, trimmed])
      setHistoryIdx(-1)

      const [command, ...args] = trimmed.split(/\s+/)
      const arg = args.join(' ')

      switch (command) {
        case 'help':
          addLine('output', HELP_TEXT)
          break

        case 'whoami':
          addLine('output', WHOAMI)
          break

        case 'pwd':
          addLine('output', cwd)
          break

        case 'clear':
          setLines([])
          break

        case 'history':
          addLine('output', history.map((h, i) => `  ${i + 1}  ${h}`).join('\n') || '(no history)')
          break

        case 'ls': {
          const dir = FILE_SYSTEM[cwd]
          if (dir?.type === 'dir' && dir.children) {
            addLine('output', dir.children.join('  '))
          } else {
            addLine('output', `ls: cannot access '${cwd}': Not a directory`)
          }
          break
        }

        case 'cd': {
          if (!arg || arg === '/') {
            setCwd('/')
            break
          }
          if (arg === '..') {
            const parts = cwd.split('/').filter(Boolean)
            parts.pop()
            setCwd(parts.length ? `/${parts.join('/')}/` : '/')
            break
          }
          // Resolve path
          let target = arg.startsWith('/') ? arg : `${cwd}${arg}`
          if (!target.endsWith('/') && !target.endsWith('.md')) target += '/'
          if (FILE_SYSTEM[target]) {
            setCwd(target.endsWith('/') ? target : cwd)
            // Navigate browser
            const route = PATH_MAP[target]
            if (route) navigate({ to: route })
          } else {
            // Try as a route anyway
            const route = PATH_MAP[target] || `/${arg}`
            navigate({ to: route })
            addLine('output', `cd: navigating to ${route}`)
          }
          break
        }

        case 'cat': {
          if (!arg) {
            addLine('output', 'cat: missing file operand')
            break
          }
          const filePath = arg.startsWith('/') ? arg : `${cwd}${arg}`
          const file = FILE_SYSTEM[filePath]
          if (file?.type === 'file' && file.content) {
            addLine('output', file.content)
          } else {
            addLine('output', `cat: ${arg}: No such file`)
          }
          break
        }

        case 'open': {
          if (!arg) {
            addLine('output', 'open: missing URL')
            break
          }
          const url = arg.startsWith('http') ? arg : `https://${arg}`
          window.open(url, '_blank')
          addLine('output', `Opening ${url}...`)
          break
        }

        default:
          addLine('output', `command not found: ${command}. Type "help" for available commands.`)
      }
    },
    [cwd, history, addLine, navigate],
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      exec(input)
      setInput('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length > 0) {
        const idx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1)
        setHistoryIdx(idx)
        setInput(history[idx])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIdx >= 0) {
        const idx = historyIdx + 1
        if (idx >= history.length) {
          setHistoryIdx(-1)
          setInput('')
        } else {
          setHistoryIdx(idx)
          setInput(history[idx])
        }
      }
    }
  }

  // Hide on mobile
  if (typeof window !== 'undefined' && 'ontouchstart' in window) return null

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Terminal window */}
      <div
        className={cn(
          'relative w-full max-w-2xl rounded-lg border shadow-2xl',
          'border-slate-700 bg-[#0d1117]',
        )}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between border-b border-slate-700 px-4 py-2">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </div>
          <span className="font-mono text-xs text-slate-500">
            adryanev@web:~
          </span>
          <button
            onClick={() => setOpen(false)}
            className="text-slate-500 hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Terminal body */}
        <div
          ref={scrollRef}
          className="h-80 overflow-y-auto p-4 font-mono text-sm"
          onClick={() => inputRef.current?.focus()}
        >
          {lines.map((line, i) => (
            <div key={i} className={cn('whitespace-pre-wrap', line.type === 'input' ? 'text-green-400' : 'text-slate-300')}>
              {line.text}
            </div>
          ))}

          {/* Input line */}
          <div className="flex items-center text-green-400">
            <span>{cwd} $ </span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent outline-none text-green-400 caret-green-400"
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
