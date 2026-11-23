import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import {
  getResumeEntries,
  deleteResumeEntry,
  reorderResumeEntries,
} from '@/server/functions/resume.functions'
import { resumeTypes } from '@/db/schema/enums'
import { formatResumeDateRange } from '@/lib/resume-dates'
import { useTransient } from '@/hooks/useTransient'
import { usePersistedOrder } from '@/hooks/usePersistedOrder'
import { PageHeader, Button, FormError } from '@/components/ui'
import {
  ResumeEntryForm,
  resumeTypeLabels,
} from '@/components/admin/ResumeEntryForm'
import type { ResumeEntry, ResumeType } from '@/components/admin/ResumeEntryForm'
import { DeleteAction, RowAction, RowActions } from '@/components/admin/RowActions'
import { OrderStatusNotice, SortableList } from '@/components/admin/SortableList'
import { Reveal } from '@/components/admin/motion'

export const Route = createFileRoute('/admin/_layout/resume')({
  loader: () => getResumeEntries(),
  component: ResumePage,
})

const HIGHLIGHT_MS = 1600
const NOTICE_MS = 3000

type OpenForm = { kind: 'create' } | { kind: 'edit'; id: number } | null

function ResumePage() {
  const entries = Route.useLoaderData()
  const router = useRouter()
  const [openForm, setOpenForm] = useState<OpenForm>(null)
  const [highlightId, highlight] = useTransient<number>(HIGHLIGHT_MS)
  const [notice, showNotice] = useTransient<string>(NOTICE_MS)
  const sections = useMemo(
    () =>
      resumeTypes.map((type) => ({
        type,
        entries: entries.filter((entry) => entry.type === type),
      })),
    [entries],
  )
  const deleteFn = useServerFn(deleteResumeEntry)
  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteFn({ data: { id } }),
    onSuccess: () => router.invalidate(),
  })

  const saved = (message: string) => async (id: number) => {
    await router.invalidate()
    setOpenForm(null)
    highlight(id)
    showNotice(message)
  }

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
          aria-expanded={openForm?.kind === 'create'}
          aria-controls="resume-entry-new"
          onClick={() =>
            setOpenForm(openForm?.kind === 'create' ? null : { kind: 'create' })
          }
        >
          <Plus size={18} aria-hidden="true" />
          Add entry
        </Button>
      </PageHeader>
      <p role="status" className="admin-status">
        {notice}
      </p>
      <FormError
        message={
          deleteMut.isError
            ? 'The resume entry could not be removed. Try again.'
            : ''
        }
      />
      <Reveal open={openForm?.kind === 'create'}>
        <ResumeEntryForm
          id="resume-entry-new"
          onSaved={saved('Entry created')}
          onCancel={() => setOpenForm(null)}
        />
      </Reveal>
      {sections.map((section) => (
        <ResumeSection
          key={section.type}
          type={section.type}
          entries={section.entries}
          editingId={openForm?.kind === 'edit' ? openForm.id : null}
          highlightId={highlightId}
          deletePending={deleteMut.isPending}
          onEdit={(id) => setOpenForm({ kind: 'edit', id })}
          onCancelEdit={() => setOpenForm(null)}
          onSaved={saved('Entry updated')}
          onDelete={(id) => deleteMut.mutate(id)}
        />
      ))}
    </div>
  )
}

function ResumeSection({
  type,
  entries,
  editingId,
  highlightId,
  deletePending,
  onEdit,
  onCancelEdit,
  onSaved,
  onDelete,
}: {
  type: ResumeType
  entries: ResumeEntry[]
  editingId: number | null
  highlightId: number | null
  deletePending: boolean
  onEdit: (id: number) => void
  onCancelEdit: () => void
  onSaved: (id: number) => Promise<void>
  onDelete: (id: number) => void
}) {
  const reorderFn = useServerFn(reorderResumeEntries)
  const order = usePersistedOrder(entries, (ids) => reorderFn({ data: { ids } }))
  const headingId = 'resume-' + type

  return (
    <section className="mt-10" aria-labelledby={headingId}>
      <div className="admin-section-header">
        <h2 id={headingId}>{resumeTypeLabels[type]}</h2>
        <OrderStatusNotice status={order.status} />
      </div>
      <SortableList
        as="div"
        itemAs="article"
        className="admin-records"
        items={order.items}
        getKey={(entry) => entry.id}
        itemLabel={(entry) => entry.title}
        onMove={order.move}
        onDrop={order.commit}
        highlightKey={highlightId}
      >
        {(entry, handle) => {
          const editing = editingId === entry.id
          return (
            <>
              {!editing && (
                <>
                  {handle}
                  <ResumeEntrySummary entry={entry} />
                  <RowActions>
                    <RowAction
                      label={'Edit ' + entry.title}
                      onClick={() => onEdit(entry.id)}
                    >
                      <Pencil size={16} aria-hidden="true" />
                    </RowAction>
                    <DeleteAction
                      label={'Delete ' + entry.title}
                      pending={deletePending}
                      onConfirm={() => onDelete(entry.id)}
                    />
                  </RowActions>
                </>
              )}
              <Reveal open={editing}>
                <ResumeEntryForm
                  id={'resume-entry-' + entry.id}
                  entry={entry}
                  onSaved={onSaved}
                  onCancel={onCancelEdit}
                />
              </Reveal>
            </>
          )
        }}
      </SortableList>
      {!entries.length && (
        <p className="text-text-secondary">
          No {resumeTypeLabels[type].toLowerCase()} entries. Use Add entry to
          include one.
        </p>
      )}
    </section>
  )
}

function ResumeEntrySummary({ entry }: { entry: ResumeEntry }) {
  const dates = formatResumeDateRange(entry.startDate, entry.endDate)
  return (
    <div className="admin-record__body">
      <h3 className="font-bold text-lg">{entry.title}</h3>
      {entry.organization && (
        <p>
          {entry.organizationUrl ? (
            <a
              href={entry.organizationUrl}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4"
            >
              {entry.organization}
            </a>
          ) : (
            entry.organization
          )}
          {entry.location ? ' · ' + entry.location : ''}
        </p>
      )}
      {dates && <p>{dates}</p>}
      {entry.description && (
        <p className="line-clamp-2 max-w-prose">{entry.description}</p>
      )}
      {!!entry.technology?.length && (
        <div className="adventure-tags mt-3">
          {entry.technology.map((tech) => (
            <span key={tech}>{tech}</span>
          ))}
        </div>
      )}
    </div>
  )
}
