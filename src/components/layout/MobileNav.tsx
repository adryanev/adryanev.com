import { Link } from '@tanstack/react-router'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileNavProps {
  open: boolean
  onClose: () => void
  items: ReadonlyArray<{ label: string; to: string }>
}

export function MobileNav({ open, onClose, items }: MobileNavProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 w-full max-w-xs p-6',
          'bg-white dark:bg-slate-950',
          'border-l border-slate-200 dark:border-slate-800',
        )}
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm text-slate-500 dark:text-slate-400">
            navigation
          </span>
          <button
            onClick={onClose}
            className={cn(
              'rounded-md p-2 transition-colors',
              'text-slate-600 hover:bg-slate-100',
              'dark:text-slate-400 dark:hover:bg-slate-800',
            )}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 flex flex-col gap-1">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={cn(
                'rounded-md px-3 py-3 text-base font-medium transition-colors',
                'text-slate-700 hover:text-slate-900 hover:bg-slate-100',
                'dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-800',
              )}
              activeProps={{
                className: 'text-accent dark:text-accent bg-accent/10',
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
