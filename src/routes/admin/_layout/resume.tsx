import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Plus, Save, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getResumeEntries,
  createResumeEntry,
  deleteResumeEntry,
} from '@/server/functions/resume.functions'

const TYPES = ['experience', 'education', 'certification', 'skill'] as const

export const Route = createFileRoute('/admin/_layout/resume')({
  loader: () => getResumeEntries(),
  component: ResumePage,
})

function ResumePage() {
  const entries = Route.useLoaderData()
  const [showForm, setShowForm] = useState(false)
  const [type, setType] = useState<(typeof TYPES)[number]>('experience')
  const [title, setTitle] = useState('')
  const [organization, setOrganization] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
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
      setStartDate('')
      setEndDate('')
      Route.router?.invalidate()
    },
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteFn({ data: { id } }),
    onSuccess: () => Route.router?.invalidate(),
  })

  const grouped = TYPES.map((t) => ({
    type: t,
    label: t.charAt(0).toUpperCase() + t.slice(1),
    entries: entries.filter((e) => e.type === t),
  }))

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Resume</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage resume entries</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className={cn('flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium', 'bg-accent text-slate-950 hover:bg-accent-hover')}>
          <Plus className="h-4 w-4" /> Add Entry
        </button>
      </div>

      {showForm && (
        <div className="mt-4 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium">Type</label>
                <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className={cn('w-full rounded-md border px-3 py-2 text-sm', 'border-slate-300 dark:border-slate-700 dark:bg-slate-800')}>
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={cn('w-full rounded-md border px-3 py-2 text-sm', 'border-slate-300 dark:border-slate-700 dark:bg-slate-800')} />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium">Organization</label>
                <input type="text" value={organization} onChange={(e) => setOrganization(e.target.value)} className={cn('w-full rounded-md border px-3 py-2 text-sm', 'border-slate-300 dark:border-slate-700 dark:bg-slate-800')} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Location</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className={cn('w-full rounded-md border px-3 py-2 text-sm', 'border-slate-300 dark:border-slate-700 dark:bg-slate-800')} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={cn('w-full rounded-md border px-3 py-2 text-sm', 'border-slate-300 dark:border-slate-700 dark:bg-slate-800')} />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium">Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={cn('w-full rounded-md border px-3 py-2 text-sm', 'border-slate-300 dark:border-slate-700 dark:bg-slate-800')} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">End Date <span className="text-slate-400">(blank = current)</span></label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={cn('w-full rounded-md border px-3 py-2 text-sm', 'border-slate-300 dark:border-slate-700 dark:bg-slate-800')} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Sort Order</label>
                <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className={cn('w-full rounded-md border px-3 py-2 text-sm', 'border-slate-300 dark:border-slate-700 dark:bg-slate-800')} />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => createMut.mutate()} disabled={!title.trim() || createMut.isPending} className="flex items-center gap-2 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-slate-950 disabled:opacity-60">
                <Save className="h-3 w-3" /> Save
              </button>
              <button onClick={() => setShowForm(false)} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-8">
        {grouped.map((group) => (
          <div key={group.type}>
            <h2 className="mb-3 text-lg font-semibold capitalize">{group.label}</h2>
            {group.entries.length === 0 ? (
              <p className="text-sm text-slate-400">No entries</p>
            ) : (
              <div className="space-y-2">
                {group.entries.map((entry) => (
                  <div key={entry.id} className="flex items-start justify-between rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-800">
                    <div>
                      <p className="font-medium">{entry.title}</p>
                      {entry.organization && <p className="text-sm text-slate-500">{entry.organization}{entry.location ? ` — ${entry.location}` : ''}</p>}
                      {entry.startDate && (
                        <p className="text-xs text-slate-400">
                          {entry.startDate} — {entry.endDate ?? 'Present'}
                        </p>
                      )}
                    </div>
                    <button onClick={() => { if (confirm('Delete?')) deleteMut.mutate(entry.id) }} className="text-slate-400 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
