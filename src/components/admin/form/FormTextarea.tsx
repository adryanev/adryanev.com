import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export const FormTextarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'w-full bg-[var(--bg-primary)] border border-[var(--border-color)] px-3 py-2 text-sm transition-colors outline-none focus-visible:border-[var(--accent)] focus-visible:ring-1 focus-visible:ring-[var(--accent)] resize-none rounded-none',
      className,
    )}
    {...props}
  />
))

FormTextarea.displayName = 'FormTextarea'
