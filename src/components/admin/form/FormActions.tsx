import { Save } from 'lucide-react'

export function FormActions({ isPending, isEditing, onCancel, saveLabel, children }: {
  isPending: boolean; isEditing: boolean; onCancel: () => void; saveLabel?: string; children?: React.ReactNode
}) {
  return <div className="admin-form-actions">
    <div role="status" className="text-sm text-text-secondary">{children}</div>
    <div><button type="button" className="admin-action admin-action--secondary" onClick={onCancel} disabled={isPending}>Cancel</button>
      <button type="submit" className="admin-action" disabled={isPending}><Save size={18} aria-hidden="true" />{isPending ? 'Saving…' : saveLabel ?? (isEditing ? 'Save changes' : 'Create')}</button>
    </div>
  </div>
}
