import { Github, Linkedin, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/adryanev', icon: Github },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/adryanev', icon: Linkedin },
  { label: 'Email', href: 'mailto:hello@adryanev.com', icon: Mail },
]

export function Footer() {
  return (
    <footer
      className={cn(
        'border-t',
        'border-slate-200 bg-white',
        'dark:border-slate-800 dark:bg-slate-950',
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6">
        <div className="text-center sm:text-left">
          <p className="font-mono text-sm text-slate-600 dark:text-slate-400">
            Adryan Eka Vandra
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Software Engineer
          </p>
        </div>

        <div className="flex items-center gap-4">
          {socialLinks.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'rounded-md p-2 transition-colors',
                'text-slate-500 hover:text-slate-900 hover:bg-slate-100',
                'dark:text-slate-500 dark:hover:text-slate-100 dark:hover:bg-slate-800',
              )}
              aria-label={label}
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>

        <div className="text-center sm:text-right">
          <p className="font-mono text-xs text-slate-400 dark:text-slate-600">
            &copy; {new Date().getFullYear()}
          </p>
          <p className="mt-1 hidden font-mono text-xs text-slate-400 dark:text-slate-600 sm:block">
            Press{' '}
            <kbd className="rounded bg-slate-100 px-1 dark:bg-slate-800">Ctrl+`</kbd>{' '}
            for terminal
          </p>
        </div>
      </div>
    </footer>
  )
}
