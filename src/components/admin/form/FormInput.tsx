import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export const FormInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'w-full bg-[var(--bg-primary)] border border-[var(--border-color)] px-3 py-2 text-sm transition-colors outline-none focus-visible:border-[var(--accent)] focus-visible:ring-1 focus-visible:ring-[var(--accent)] rounded-none',
      className,
    )}
    {...props}
  />
))

FormInput.displayName = 'FormInput'
