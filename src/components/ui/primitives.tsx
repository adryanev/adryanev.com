import { forwardRef, useContext, useId } from 'react'
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TableHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { Slot } from '@radix-ui/react-slot'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FieldContext } from './FieldContext'

export const buttonVariants = [
  'primary',
  'secondary',
  'accent',
  'inverse',
  'danger',
  'ghost',
  'plain',
] as const
export const controlSizes = ['sm', 'md', 'lg', 'feature', 'icon'] as const
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean
  variant?: (typeof buttonVariants)[number]
  size?: (typeof controlSizes)[number]
  pending?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      asChild = false,
      variant = 'primary',
      size,
      pending = false,
      disabled,
      type,
      className,
      onClickCapture,
      tabIndex,
      ...props
    },
    ref,
  ) {
    const Component = asChild ? Slot : 'button'
    const blocked = disabled || pending
    return (
      <Component
        {...props}
        ref={ref}
        className={cn('ui-button', className)}
        data-variant={variant}
        data-size={size ?? (variant === 'plain' ? undefined : 'md')}
        data-disabled={blocked || undefined}
        aria-busy={pending || undefined}
        aria-disabled={blocked || undefined}
        disabled={asChild ? undefined : blocked}
        type={asChild ? undefined : (type ?? 'button')}
        tabIndex={blocked && asChild ? -1 : tabIndex}
        onClickCapture={(event) => {
          if (blocked) {
            event.preventDefault()
            event.stopPropagation()
            return
          }
          onClickCapture?.(event)
        }}
      />
    )
  },
)

type ControlAppearance = { appearance?: 'default' | 'plain' }
export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & ControlAppearance
>(function Input(
  { className, id, type, appearance = 'default', ...props },
  ref,
) {
  const field = useContext(FieldContext)
  const inheritsField =
    type !== 'checkbox' && type !== 'radio' && type !== 'file'
  return (
    <input
      ref={ref}
      type={type}
      id={id ?? (inheritsField ? field?.id : undefined)}
      aria-invalid={field?.invalid || undefined}
      aria-describedby={field?.descriptionId}
      {...props}
      className={cn(
        'ui-input',
        appearance === 'default' && 'ui-control',
        className,
      )}
    />
  )
})
export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & ControlAppearance
>(function Textarea({ className, id, appearance = 'default', ...props }, ref) {
  const field = useContext(FieldContext)
  return (
    <textarea
      ref={ref}
      id={id ?? field?.id}
      aria-invalid={field?.invalid || undefined}
      aria-describedby={field?.descriptionId}
      {...props}
      className={cn(
        'ui-textarea',
        appearance === 'default' && 'ui-control',
        className,
      )}
    />
  )
})
export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, id, ...props }, ref) {
  const field = useContext(FieldContext)
  return (
    <select
      ref={ref}
      id={id ?? field?.id}
      aria-invalid={field?.invalid || undefined}
      aria-describedby={field?.descriptionId}
      {...props}
      className={cn('ui-select ui-control', className)}
    />
  )
})

export function Field({
  label,
  htmlFor,
  optional,
  hint,
  error,
  children,
  className,
}: {
  label: string
  htmlFor?: string
  optional?: boolean
  hint?: string
  error?: string
  children: ReactNode
  className?: string
}) {
  const generated = useId()
  const id = htmlFor ?? generated
  const labelId = id + '-label'
  const descriptionId = error || hint ? id + '-description' : undefined
  return (
    <FieldContext.Provider
      value={{ id, labelId, descriptionId, invalid: !!error }}
    >
      <div
        className={cn('ui-field', className)}
        role="group"
        aria-labelledby={labelId}
      >
        <label id={labelId} htmlFor={id} className="ui-field__label">
          {label}
          {optional && <span className="ui-field__optional">(optional)</span>}
        </label>
        {children}
        {error ? (
          <FieldError id={descriptionId}>{error}</FieldError>
        ) : hint ? (
          <p id={descriptionId} className="ui-field__hint">
            {hint}
          </p>
        ) : null}
      </div>
    </FieldContext.Provider>
  )
}
export function FieldError({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p {...props} role="alert" className={cn('ui-field-error', className)} />
  )
}
export function Feedback({
  tone = 'info',
  className,
  role,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  tone?: 'info' | 'success' | 'warning' | 'danger'
}) {
  return (
    <div
      {...props}
      role={role ?? (tone === 'danger' ? 'alert' : 'status')}
      className={cn('ui-feedback', className)}
      data-tone={tone}
    />
  )
}
export function FormError({ message }: { message?: string | null }) {
  return message ? (
    <Feedback tone="danger">
      <AlertTriangle size={18} aria-hidden="true" />
      <span>{message}</span>
    </Feedback>
  ) : null
}

export function Badge({
  tone = 'neutral',
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent'
}) {
  return (
    <span {...props} data-tone={tone} className={cn('ui-badge', className)} />
  )
}
export function Panel({
  asChild = false,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { asChild?: boolean }) {
  const Component = asChild ? Slot : 'div'
  return <Component {...props} className={cn('ui-panel', className)} />
}
export function PageHeader({
  className,
  variant = 'section',
  ...props
}: HTMLAttributes<HTMLElement> & { variant?: 'section' | 'chapter' }) {
  return (
    <header
      {...props}
      className={cn(
        'ui-page-header',
        variant === 'chapter' && 'ui-chapter-header',
        className,
      )}
      data-variant={variant}
    />
  )
}
export function EmptyState({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn('ui-empty-state', className)} />
}
export function PageState({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn('ui-page-state', className)} />
}
export function TableScroll({
  className,
  tabIndex = 0,
  role = 'region',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      role={role}
      tabIndex={tabIndex}
      className={cn('ui-table-scroll', className)}
    />
  )
}
export const Table = forwardRef<
  HTMLTableElement,
  TableHTMLAttributes<HTMLTableElement>
>(function Table({ className, ...props }, ref) {
  return <table {...props} ref={ref} className={cn('ui-table', className)} />
})
