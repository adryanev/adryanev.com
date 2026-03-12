import { AlertTriangle } from 'lucide-react'

export function FormError({ message }: { message: string }) {
  if (!message) return null

  return (
    <div role="alert" aria-live="polite" className="border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400 flex items-start gap-3">
      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  )
}
