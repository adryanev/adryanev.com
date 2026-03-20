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
import { WEBHOOK_EVENTS, type WebhookEvent } from '@/lib/webhook-events'

const WEBHOOK_EVENT_LABELS: Record<WebhookEvent, string> = {
  'post.created': 'Post Created',
  'post.updated': 'Post Updated',
  'post.deleted': 'Post Deleted',
}

type WebhookData = {
  id?: number
  url: string
  events: WebhookEvent[]
  active: boolean
}

export function WebhookForm({ initial }: { initial?: WebhookData }) {
  const navigate = useNavigate()
  const isEditing = !!initial?.id

  const [url, setUrl] = useState(initial?.url ?? '')
  const [events, setEvents] = useState<WebhookEvent[]>(initial?.events ?? ['post.created', 'post.updated', 'post.deleted'])
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
      if (!isEditing && result && 'secret' in result && typeof result.secret === 'string') {
        setNewSecret(result.secret)
      } else {
        navigate({ to: '/admin/webhooks' })
      }
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Failed to save'),
  })

  function toggleEvent(event: WebhookEvent) {
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
            <label key={evt} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={events.includes(evt)}
                onChange={() => toggleEvent(evt)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              <span className="text-sm">
                <code className="text-xs bg-[var(--bg-secondary)] border border-[var(--border-color)] px-1.5 py-0.5">
                  {evt}
                </code>
                <span className="ml-2 text-[var(--text-secondary)]">{WEBHOOK_EVENT_LABELS[evt]}</span>
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

      <FormActions
        isPending={saveMutation.isPending}
        isEditing={isEditing}
        onCancel={() => navigate({ to: '/admin/webhooks' })}
      />
    </form>
  )
}
