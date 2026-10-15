import { Save } from 'lucide-react'

import { Button } from '@/components/ui'

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
    <div className="admin-form-actions">
      <div role="status" className="text-sm text-text-secondary">
        {children}
      </div>
      <div>
        <Button
          variant="secondary"
          type="button"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={isPending}>
          <Save size={18} aria-hidden="true" />
          {isPending
            ? 'Saving…'
            : (saveLabel ?? (isEditing ? 'Save changes' : 'Create'))}
        </Button>
      </div>
    </div>
  )
}
