import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { X, Terminal as TerminalIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useScrollLock } from '@/hooks/useScrollLock'

import { useDialogFocus } from '@/hooks/useDialogFocus'
import { Button, Input } from '@/components/ui'
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

const WHOAMI = `ADRYAN EKA VANDRA
ROLE: SOFTWARE ENGINEER
LOCATION: INDONESIA
GITHUB: github.com/adryanev
EMAIL: me@adryanev.com
`

const FILE_SYSTEM: Record<
  string,
  { type: 'dir' | 'file'; children?: string[]; content?: string }
> = {
  '/': {
    type: 'dir',
    children: [
      'about.md',
      'resume/',
      'blog/',
      'portfolio/',
      'saas/',
      'contact.md',
    ],
  },
  '/about.md': {
    type: 'file',
    content:
      'Software Engineer based in Indonesia.\nBuilding resilient, high-performance systems with a focus on clean architecture.',
  },
  '/resume/': {
    type: 'dir',
    children: ['experience/', 'education/', 'skills/'],
  },
  '/blog/': { type: 'dir', children: ['(posts loaded from database)'] },
  '/portfolio/': {
    type: 'dir',
    children: [
      'work/',
      'lexicon/',
      'topapp-id/',
      'apple-developer-academy/',
      'freelance/',
      'college/',
      'open-source/',
    ],
  },
  '/saas/': { type: 'dir', children: ['(SaaS products loaded from database)'] },
  '/contact.md': {
    type: 'file',
    content: 'Want to get in touch?\nVisit /contact or email me@adryanev.com',
  },
}

const PATH_MAP: Record<string, string> = {
  '/about.md': '/about',
  '/resume/': '/resume',
  '/blog/': '/blog',
  '/portfolio/': '/portfolio',
  '/portfolio/work/': '/portfolio/work',
  '/portfolio/lexicon/': '/portfolio/lexicon',
  '/portfolio/topapp-id/': '/portfolio/topapp-id',
  '/portfolio/apple-developer-academy/': '/portfolio/apple-developer-academy',
  '/portfolio/freelance/': '/portfolio/freelance',
  '/portfolio/college/': '/portfolio/college',
  '/portfolio/open-source/': '/portfolio/open-source',
  '/saas/': '/saas',
  '/contact.md': '/contact',
}

type Line = { type: 'input' | 'output'; text: string }

export function TerminalOverlay() {
  const [open, setOpen] = useState(false)
  const [lines, setLines] = useState<Line[]>([
    { type: 'output', text: 'Portfolio terminal' },
    { type: 'output', text: 'Type "help" for available commands.' },
  ])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const [cwd, setCwd] = useState('/')
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useDialogFocus(open, dialogRef, close)
  const navigate = useNavigate()

  // Toggle with Ctrl+`
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault()
        window.dispatchEvent(new Event('site:close-search'))
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', handler)
    const show = () => {
      window.dispatchEvent(new Event('site:close-search'))
      setOpen(true)
    }
    window.addEventListener('site:terminal', show)
    window.addEventListener('site:close-terminal', close)
    return () => {
      document.removeEventListener('keydown', handler)
      window.removeEventListener('site:terminal', show)
      window.removeEventListener('site:close-terminal', close)
    }
  }, [])

  // Lock body scroll when opened
  useScrollLock(open)

  // Focus input when opened
  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
    }
  }, [open])

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
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

      const [rawCommand, ...args] = trimmed.split(/\s+/)
      const command = rawCommand.toLowerCase()
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
          addLine(
            'output',
            history
              .map((h, i) => `  ${(i + 1).toString().padStart(2, '0')}  ${h}`)
              .join('\n') || '(empty)',
          )
          break

        case 'ls': {
          const dir = FILE_SYSTEM[cwd]
          if (dir?.type === 'dir' && dir.children) {
            addLine('output', dir.children.join('  '))
          } else {
            addLine('output', `err: cannot access '${cwd}': not a directory`)
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
            addLine('output', `navigating to ${route}`)
          }
          break
        }

        case 'cat': {
          if (!arg) {
            addLine('output', 'err: missing operand')
            break
          }
          const filePath = arg.startsWith('/') ? arg : `${cwd}${arg}`
          const file = FILE_SYSTEM[filePath]
          if (file?.type === 'file' && file.content) {
            addLine('output', file.content)
          } else {
            addLine('output', `err: ${arg}: file not found`)
          }
          break
        }

        case 'open': {
          if (!arg) {
            addLine('output', 'err: missing url')
            break
          }
          const url = arg.startsWith('http') ? arg : `https://${arg}`
          try {
            new URL(url)
          } catch {
            addLine('output', `err: invalid url '${arg}'`)
            break
          }
          window.open(url, '_blank', 'noopener,noreferrer')
          addLine('output', `opening ${url}...`)
          break
        }

        default:
          addLine(
            'output',
            `command not found: ${command}. Type "help" for available commands.`,
          )
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
        const idx =
          historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1)
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
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  if (!open) return null

  return (
    <div className="chapter-terminal fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-text-primary/80 backdrop-blur-[4px]"
        onClick={() => setOpen(false)}
      />

      {/* Terminal window */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Terminal"
        className="relative w-full max-w-3xl brutal-border brutal-shadow-lg bg-bg-primary overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-300 overscroll-contain"
      >
        {/* Title bar */}
        <div className="flex items-center justify-between border-b-2 border-text-primary bg-bg-secondary px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-1 bg-accent brutal-border">
              <TerminalIcon className="h-4 w-4 text-accent-fg" />
            </div>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-text-primary">
              Terminal
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            aria-label="Close terminal"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Terminal body */}
        <div
          ref={scrollRef}
          className="chapter-terminal__body overflow-y-auto font-mono text-sm leading-relaxed"
          onClick={() => inputRef.current?.focus()}
        >
          <div
            className="space-y-2"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            {lines.map((line, i) => (
              <div
                key={i}
                className={cn(
                  'whitespace-pre-wrap break-words',
                  line.type === 'input'
                    ? 'text-accent font-bold'
                    : 'text-text-primary',
                )}
              >
                {line.type === 'input' ? (
                  <span className="flex gap-2">
                    <span>{line.text}</span>
                  </span>
                ) : (
                  line.text
                )}
              </div>
            ))}
          </div>

          {/* Input line */}
          <div className="flex items-center gap-2 text-accent font-bold mt-4">
            <span>{cwd} $ </span>
            <Input
              appearance="plain"
              ref={inputRef}
              data-dialog-autofocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Terminal input"
              className="flex-1 bg-transparent outline-none focus-visible:outline-none text-accent caret-accent"
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </div>

        {/* Footer info */}
        <div className="border-t-2 border-text-primary bg-bg-secondary px-6 py-2 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 font-mono text-[10px] font-bold text-text-secondary tracking-wider">
          <span>Portfolio commands</span>
          <span>Ctrl+` to toggle</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  )
}
