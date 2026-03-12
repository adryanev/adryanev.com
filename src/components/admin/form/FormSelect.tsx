import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export const FormSelect = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'w-full bg-[var(--bg-primary)] border border-[var(--border-color)] px-3 py-2 text-sm transition-colors outline-none focus-visible:border-[var(--accent)] focus-visible:ring-1 focus-visible:ring-[var(--accent)] rounded-none',
      className,
    )}
    {...props}
  >
    {children}
  </select>
))

FormSelect.displayName = 'FormSelect'
