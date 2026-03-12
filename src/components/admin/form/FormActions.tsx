import { Save } from 'lucide-react'

export function FormActions({
  isPending,
  isEditing,
  onCancel,
  saveLabel,
  children,
}: {
  isPending: boolean
  isEditing: boolean
  onCancel: () => void
  saveLabel?: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between border-t border-[var(--border-color)] pt-6 gap-4">
      <div className="text-xs text-[var(--text-secondary)]">
        {children}
      </div>
      <div className="flex w-full sm:w-auto gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 sm:flex-none border border-[var(--border-color)] bg-[var(--bg-secondary)] px-6 py-2.5 text-sm font-semibold uppercase text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-primary)] hover:border-[var(--text-primary)] rounded-none"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 border border-[var(--accent)] bg-[var(--accent)] px-8 py-2.5 text-sm font-bold uppercase text-[var(--accent-fg)] transition-colors hover:bg-transparent hover:text-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed rounded-none"
        >
          <Save className="h-4 w-4" />
          {isPending ? 'Saving\u2026' : (saveLabel ?? (isEditing ? 'Update' : 'Create'))}
        </button>
      </div>
    </div>
  )
}
