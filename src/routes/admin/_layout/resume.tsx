import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Plus, Save, Trash2 } from 'lucide-react'
import {
  getResumeEntries,
  createResumeEntry,
  deleteResumeEntry,
} from '@/server/functions/resume.functions'

import {
  PageHeader,
  Button,
  Field as FormField,
  Input as FormInput,
  Select as FormSelect,
  Textarea as FormTextarea,
  FormError,
} from '@/components/ui'
const TYPES = ['experience', 'education', 'certification', 'skill'] as const

export const Route = createFileRoute('/admin/_layout/resume')({
  loader: () => getResumeEntries(),
  component: ResumePage,
})

function ResumePage() {
  const entries = Route.useLoaderData()
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [type, setType] = useState<(typeof TYPES)[number]>('experience')
  const [title, setTitle] = useState('')
  const [organization, setOrganization] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [technology, setTechnology] = useState('')
  const [sortOrder, setSortOrder] = useState(0)
  const createFn = useServerFn(createResumeEntry)
  const deleteFn = useServerFn(deleteResumeEntry)
  const createMut = useMutation({
    mutationFn: () =>
      createFn({
        data: {
          type,
          title,
          organization: organization || undefined,
          location: location || undefined,
          description: description || undefined,
          technology: technology.trim()
            ? technology
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean)
            : undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          sortOrder,
        },
      }),
    onSuccess: () => {
      setShowForm(false)
      setTitle('')
      setOrganization('')
      setLocation('')
      setDescription('')
      setTechnology('')
      setStartDate('')
      setEndDate('')
      setSortOrder(0)
      void router.invalidate()
    },
  })
  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteFn({ data: { id } }),
    onSuccess: () => router.invalidate(),
  })
  const fields = [
    { label: 'Title', value: title, change: setTitle, required: true },
    { label: 'Organization', value: organization, change: setOrganization },
    { label: 'Location', value: location, change: setLocation },
    {
      label: 'Technologies, separated by commas',
      value: technology,
      change: setTechnology,
    },
    {
      label: 'Start date',
      value: startDate,
      change: setStartDate,
      type: 'date',
    },
    {
      label: 'End date, leave blank for current',
      value: endDate,
      change: setEndDate,
      type: 'date',
    },
  ]
  return (
    <div>
      <PageHeader>
        <div>
          <h1>Resume</h1>
          <p>
            Experience, education, and skills shown on your public resume and
            PDF.
          </p>
        </div>
        <Button
          variant="primary"
          aria-expanded={showForm}
          aria-controls="resume-entry"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={18} />
          Add entry
        </Button>
      </PageHeader>
      <FormError
        message={
          createMut.isError || deleteMut.isError
            ? 'The resume entry could not be saved or removed. Check the values and try again.'
            : ''
        }
      />
      {showForm && (
        <form
          id="resume-entry"
          className="admin-inline-form space-y-6"
          onSubmit={(event) => {
            event.preventDefault()
            if (!createMut.isPending) createMut.mutate()
          }}
        >
          <FormField label="Entry type">
            <FormSelect
              value={type}
              onChange={(event) => setType(event.target.value as typeof type)}
            >
              {TYPES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </FormSelect>
          </FormField>
          <div className="grid gap-6 md:grid-cols-2">
            {fields.map((field) => (
              <FormField key={field.label} label={field.label}>
                <FormInput
                  type={field.type ?? 'text'}
                  value={field.value}
                  required={field.required}
                  onChange={(event) => field.change(event.target.value)}
                />
              </FormField>
            ))}
          </div>
          <FormField label="Description" optional>
            <FormTextarea
              rows={5}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </FormField>
          <FormField label="Sort order">
            <FormInput
              type="number"
              value={sortOrder}
              onChange={(event) => setSortOrder(Number(event.target.value))}
            />
          </FormField>
          <div className="page-actions">
            <Button
              variant="primary"
              type="submit"
              disabled={!title.trim() || createMut.isPending}
            >
              <Save size={18} />
              {createMut.isPending ? 'Saving…' : 'Create entry'}
            </Button>
            <Button
              variant="secondary"
              type="button"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
      {TYPES.map((entryType) => (
        <section key={entryType} className="mt-10">
          <h2 className="capitalize mb-4">{entryType}</h2>
          <div className="admin-records">
            {entries
              .filter((entry) => entry.type === entryType)
              .map((entry) => (
                <article key={entry.id}>
                  <div>
                    <h3 className="font-bold text-lg">{entry.title}</h3>
                    {entry.organization && (
                      <p>
                        {entry.organization}
                        {entry.location ? ' · ' + entry.location : ''}
                      </p>
                    )}
                    {entry.startDate && (
                      <p>
                        {entry.startDate} to {entry.endDate ?? 'Present'}
                      </p>
                    )}
                    {entry.description && (
                      <p className="whitespace-pre-wrap max-w-prose">
                        {entry.description}
                      </p>
                    )}
                    {!!entry.technology?.length && (
                      <div className="adventure-tags mt-3">
                        {entry.technology.map((tech) => (
                          <span key={tech}>{tech}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="danger"
                    size="icon"
                    aria-label={'Delete ' + entry.title}
                    disabled={deleteMut.isPending}
                    onClick={() => {
                      if (confirm('Delete resume entry "' + entry.title + '"?'))
                        deleteMut.mutate(entry.id)
                    }}
                  >
                    <Trash2 size={18} />
                  </Button>
                </article>
              ))}
          </div>
          {!entries.some((entry) => entry.type === entryType) && (
            <p className="text-text-secondary">
              No {entryType} entries. Use Add entry to include one.
            </p>
          )}
        </section>
      ))}
    </div>
  )
}
