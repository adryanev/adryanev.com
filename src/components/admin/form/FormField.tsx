import type { ReactNode } from 'react'

export function FormField({
  label,
  htmlFor,
  optional,
  children,
}: {
  label: string
  htmlFor?: string
  optional?: boolean
  children: ReactNode
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-xs font-semibold uppercase text-[var(--text-secondary)]"
      >
        {label}
        {optional && (
          <span className="opacity-50 font-normal normal-case ml-1">(optional)</span>
        )}
      </label>
      {children}
    </div>
  )
}
