import { useState, useEffect, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'
import { FormField } from './form/FormField'
import { FormInput } from './form/FormInput'
import { FormError } from './form/FormError'
import { FormActions } from './form/FormActions'
import { createWebhook, updateWebhook } from '@/server/functions/webhooks.functions'

const WEBHOOK_EVENTS = [
  { value: 'post.created', label: 'Post Created' },
  { value: 'post.updated', label: 'Post Updated' },
  { value: 'post.deleted', label: 'Post Deleted' },
] as const

type WebhookData = {
  id?: number
  url: string
  events: string[]
  active: boolean
  secret?: string
}

export function WebhookForm({ initial }: { initial?: WebhookData }) {
  const navigate = useNavigate()
  const isEditing = !!initial?.id

  const [url, setUrl] = useState(initial?.url ?? '')
  const [events, setEvents] = useState<string[]>(initial?.events ?? ['post.created', 'post.updated', 'post.deleted'])
  const [active, setActive] = useState(initial?.active ?? true)
  const [error, setError] = useState('')
  const [newSecret, setNewSecret] = useState('')
  const [dirty, setDirty] = useState(false)
  const initialRef = useRef(initial)

  useEffect(() => {
    const init = initialRef.current
    const changed = url !== (init?.url ?? '') ||
      active !== (init?.active ?? true) ||
      JSON.stringify(events) !== JSON.stringify(init?.events ?? ['post.created', 'post.updated', 'post.deleted'])
    setDirty(changed)
  }, [url, events, active])

  useUnsavedChanges(dirty)

  const createFn = useServerFn(createWebhook)
  const updateFn = useServerFn(updateWebhook)

  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = { url, events, active }
      if (isEditing) return updateFn({ data: { ...data, id: initial!.id! } })
      return createFn({ data })
    },
    onSuccess: (result) => {
      if (!isEditing && result && 'secret' in result) {
        setNewSecret(result.secret as string)
      } else {
        navigate({ to: '/admin/webhooks' })
      }
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Failed to save'),
  })

  function toggleEvent(event: string) {
    setEvents((prev) =>
      prev.includes(event)
        ? prev.filter((e) => e !== event)
        : [...prev, event],
    )
  }

  if (newSecret) {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="border border-green-500/30 bg-green-500/5 p-6">
          <h2 className="text-lg font-bold text-green-500">Webhook Created</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Copy the signing secret below. It will not be shown again.
          </p>
          <div className="mt-4">
            <code className="block break-all border border-[var(--border-color)] bg-[var(--bg-secondary)] p-3 text-sm font-mono">
              {newSecret}
            </code>
          </div>
          <button
            onClick={() => navigate({ to: '/admin/webhooks' })}
            className="mt-4 border border-[var(--border-color)] px-4 py-2 text-sm hover:bg-[var(--bg-secondary)] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); setError(''); saveMutation.mutate() }}
      className="space-y-6 max-w-4xl"
    >
      <FormError message={error} />

      <FormField label="Endpoint URL">
        <FormInput
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/webhook"
          required
        />
      </FormField>

      <FormField label="Events">
        <div className="space-y-2">
          {WEBHOOK_EVENTS.map((evt) => (
            <label key={evt.value} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={events.includes(evt.value)}
                onChange={() => toggleEvent(evt.value)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              <span className="text-sm">
                <code className="text-xs bg-[var(--bg-secondary)] border border-[var(--border-color)] px-1.5 py-0.5">
                  {evt.value}
                </code>
                <span className="ml-2 text-[var(--text-secondary)]">{evt.label}</span>
              </span>
            </label>
          ))}
        </div>
      </FormField>

      <FormField label="Status">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          <span className="text-sm">Active</span>
        </label>
      </FormField>

      {isEditing && initial?.secret && (
        <FormField label="Signing Secret">
          <code className="block break-all border border-[var(--border-color)] bg-[var(--bg-secondary)] p-3 text-sm font-mono text-[var(--text-secondary)]">
            {initial.secret.slice(0, 8)}{'•'.repeat(24)}
          </code>
        </FormField>
      )}

      <FormActions
        isPending={saveMutation.isPending}
        isEditing={isEditing}
        onCancel={() => navigate({ to: '/admin/webhooks' })}
      />
    </form>
  )
}
