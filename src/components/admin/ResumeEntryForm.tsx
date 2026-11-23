import { useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { Save } from 'lucide-react'
import type { resumeEntries } from '@/db/schema/resume'
import { resumeTypes } from '@/db/schema/enums'
import {
  createResumeEntry,
  updateResumeEntry,
} from '@/server/functions/resume.functions'
import {
  Button,
  Field,
  FormError,
  Input,
  Select,
  Textarea,
} from '@/components/ui'

export type ResumeEntry = typeof resumeEntries.$inferSelect
export type ResumeType = ResumeEntry['type']

export const resumeTypeLabels: Record<ResumeType, string> = {
  experience: 'Experience',
  education: 'Education',
  certification: 'Certifications',
  skill: 'Skills',
}

type OptionalText =
  | 'organization'
  | 'organizationUrl'
  | 'location'
  | 'description'
  | 'startDate'
  | 'endDate'

// Form-shaped entry: blank strings for empty fields, technology as typed text
type ResumeDraft = Pick<ResumeEntry, 'type' | 'title'> &
  Record<OptionalText, string> & { technology: string }

function draftFrom(entry: ResumeEntry | undefined): ResumeDraft {
  return {
    type: entry?.type ?? 'experience',
    title: entry?.title ?? '',
    organization: entry?.organization ?? '',
    organizationUrl: entry?.organizationUrl ?? '',
    location: entry?.location ?? '',
    description: entry?.description ?? '',
    startDate: entry?.startDate ?? '',
    endDate: entry?.endDate ?? '',
    technology: entry?.technology?.join(', ') ?? '',
  }
}

const optional = (value: string) => value.trim() || undefined

function entryInput(draft: ResumeDraft) {
  const technology = draft.technology
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  return {
    type: draft.type,
    title: draft.title.trim(),
    organization: optional(draft.organization),
    organizationUrl: optional(draft.organizationUrl),
    location: optional(draft.location),
    description: optional(draft.description),
    startDate: optional(draft.startDate),
    endDate: optional(draft.endDate),
    technology: technology.length ? technology : undefined,
  }
}

const textFields: {
  key: OptionalText | 'title' | 'technology'
  label: string
  type?: string
  hint?: string
}[] = [
  { key: 'title', label: 'Title' },
  { key: 'organization', label: 'Organization' },
  { key: 'organizationUrl', label: 'Organization URL', type: 'url' },
  { key: 'location', label: 'Location' },
  { key: 'startDate', label: 'Start date', type: 'date' },
  {
    key: 'endDate',
    label: 'End date',
    type: 'date',
    hint: 'Leave blank for a current role.',
  },
  {
    key: 'technology',
    label: 'Technologies',
    hint: 'Separate with commas.',
  },
]

export function ResumeEntryForm({
  id,
  entry,
  onSaved,
  onCancel,
}: {
  id: string
  entry?: ResumeEntry
  onSaved: (entryId: number) => Promise<void>
  onCancel: () => void
}) {
  const [draft, setDraft] = useState(() => draftFrom(entry))
  const createFn = useServerFn(createResumeEntry)
  const updateFn = useServerFn(updateResumeEntry)
  const save = useMutation({
    mutationFn: async () => {
      const data = entryInput(draft)
      if (!entry) return (await createFn({ data })).id
      await updateFn({ data: { ...data, id: entry.id } })
      return entry.id
    },
    onSuccess: onSaved,
  })
  const update = (key: keyof ResumeDraft, value: string) =>
    setDraft((current) => ({ ...current, [key]: value }))

  return (
    <form
      id={id}
      className="admin-inline-form space-y-6"
      aria-label={entry ? 'Edit ' + entry.title : 'New resume entry'}
      onSubmit={(event) => {
        event.preventDefault()
        if (!save.isPending) save.mutate()
      }}
    >
      <FormError
        message={
          save.isError
            ? 'The entry could not be saved. Check the values and try again.'
            : ''
        }
      />
      <Field label="Entry type">
        <Select
          value={draft.type}
          onChange={(event) => update('type', event.target.value)}
        >
          {resumeTypes.map((type) => (
            <option key={type} value={type}>
              {resumeTypeLabels[type]}
            </option>
          ))}
        </Select>
      </Field>
      <div className="grid gap-6 md:grid-cols-2">
        {textFields.map((field) => (
          <Field
            key={field.key}
            label={field.label}
            hint={field.hint}
            optional={field.key !== 'title'}
          >
            <Input
              type={field.type ?? 'text'}
              value={draft[field.key]}
              required={field.key === 'title'}
              autoFocus={field.key === 'title'}
              onChange={(event) => update(field.key, event.target.value)}
            />
          </Field>
        ))}
      </div>
      <Field label="Description" optional>
        <Textarea
          rows={5}
          value={draft.description}
          onChange={(event) => update('description', event.target.value)}
        />
      </Field>
      <div className="page-actions">
        <Button
          variant="primary"
          type="submit"
          disabled={!draft.title.trim() || save.isPending}
        >
          <Save size={18} aria-hidden="true" />
          {save.isPending ? 'Saving…' : entry ? 'Save changes' : 'Create entry'}
        </Button>
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
