import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { X, Terminal as TerminalIcon, Minimize2 } from 'lucide-react'
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

const WHOAMI = `ADRYAN EKA VANDRA
ROLE: SOFTWARE ENGINEER
LOCATION: INDONESIA
GITHUB: github.com/adryanev
EMAIL: me@adryanev.com
STATUS: OPERATIONAL`

const FILE_SYSTEM: Record<string, { type: 'dir' | 'file'; children?: string[]; content?: string }> = {
  '/': { type: 'dir', children: ['about.md', 'resume/', 'blog/', 'portfolio/', 'saas/', 'contact.md'] },
  '/about.md': { type: 'file', content: 'Software Engineer based in Indonesia.\nBuilding resilient, high-performance systems with a focus on clean architecture.' },
  '/resume/': { type: 'dir', children: ['experience/', 'education/', 'skills/'] },
  '/blog/': { type: 'dir', children: ['(posts loaded from database)'] },
  '/portfolio/': { type: 'dir', children: ['college/', 'freelance/', 'work/', 'apple-developer-academy/', 'lexicon/'] },
  '/saas/': { type: 'dir', children: ['(SaaS products loaded from database)'] },
  '/contact.md': { type: 'file', content: 'Want to get in touch?\nVisit /contact or email me@adryanev.com' },
}

const PATH_MAP: Record<string, string> = {
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
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [lines, setLines] = useState<Line[]>([
    { type: 'output', text: 'VANDRA_OS v2.0.4 — KERNEL: BRUTALIST_UI' },
    { type: 'output', text: 'Type "help" for available commands.' },
  ])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const [cwd, setCwd] = useState('/')
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Detect touch device after hydration
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window)
  }, [])

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

  // Lock body scroll and focus input when opened
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    inputRef.current?.focus()
    return () => {
      document.body.style.overflow = ''
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

      const [command, ...args] = trimmed.toLowerCase().split(/\s+/)
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
          addLine('output', history.map((h, i) => `  ${(i + 1).toString().padStart(2, '0')}  ${h}`).join('\n') || '(empty)')
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
          window.open(url, '_blank')
          addLine('output', `opening ${url}...`)
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
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  // Hide on touch devices
  if (isTouchDevice) return null

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-text-primary/80 backdrop-blur-[4px]"
        onClick={() => setOpen(false)}
      />

      {/* Terminal window */}
      <div
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
          <div className="flex items-center gap-4">
             <button
              onClick={() => setOpen(false)}
              className="text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Minimize terminal"
            >
              <Minimize2 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setOpen(false)}
              className="text-text-secondary hover:text-accent transition-colors"
              aria-label="Close terminal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Terminal body */}
        <div
          ref={scrollRef}
          className="h-[500px] overflow-y-auto p-8 font-mono text-sm leading-relaxed scrollbar-thin"
          onClick={() => inputRef.current?.focus()}
        >
          <div className="space-y-2">
            {lines.map((line, i) => (
              <div key={i} className={cn(
                'whitespace-pre-wrap break-words',
                line.type === 'input' ? 'text-accent font-bold' : 'text-text-primary'
              )}>
                {line.type === 'input' ? (
                  <span className="flex gap-2">
                    <span className="opacity-50 tracking-tighter">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
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
            <span className="opacity-50 tracking-tighter">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
            <span>{cwd} $ </span>
            <input
              ref={inputRef}
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
        <div className="border-t-2 border-text-primary bg-bg-secondary px-6 py-2 flex justify-between font-mono text-[10px] font-bold text-text-secondary tracking-wider">
          <span>Secure</span>
          <span>Ctrl+` to toggle</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  )
}
