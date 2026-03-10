import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Mail, MailOpen, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getContacts, markContactRead, deleteContact } from '@/server/functions/contacts.functions'

export const Route = createFileRoute('/admin/_layout/contacts')({
  loader: () => getContacts(),
  component: ContactsPage,
})

function ContactsPage() {
  const contacts = Route.useLoaderData()
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const markReadFn = useServerFn(markContactRead)
  const deleteFn = useServerFn(deleteContact)

  const markReadMut = useMutation({
    mutationFn: (data: { id: number; isRead: boolean }) =>
      markReadFn({ data }),
    onSuccess: () => Route.router?.invalidate(),
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteFn({ data: { id } }),
    onSuccess: () => Route.router?.invalidate(),
  })

  return (
    <div>
      <h1 className="text-2xl font-bold">Contact Messages</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {contacts.filter((c) => !c.isRead).length} unread
      </p>

      {contacts.length === 0 ? (
        <div className="mt-12 text-center text-slate-500">No messages yet.</div>
      ) : (
        <div className="mt-6 space-y-2">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={cn(
                'rounded-lg border transition-colors',
                contact.isRead
                  ? 'border-slate-200 dark:border-slate-800'
                  : 'border-accent/30 bg-accent/5',
              )}
            >
              <div
                className="flex cursor-pointer items-center justify-between px-4 py-3"
                onClick={() => {
                  setExpandedId(expandedId === contact.id ? null : contact.id)
                  if (!contact.isRead) {
                    markReadMut.mutate({ id: contact.id, isRead: true })
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  {contact.isRead ? (
                    <MailOpen className="h-4 w-4 text-slate-400" />
                  ) : (
                    <Mail className="h-4 w-4 text-accent" />
                  )}
                  <div>
                    <p className={cn('text-sm', !contact.isRead && 'font-semibold')}>
                      {contact.name}{' '}
                      <span className="text-slate-400">({contact.email})</span>
                    </p>
                    {contact.subject && (
                      <p className="text-xs text-slate-500">{contact.subject}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">
                    {new Date(contact.createdAt).toLocaleDateString()}
                  </span>
                  {expandedId === contact.id ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </div>
              </div>

              {expandedId === contact.id && (
                <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-800">
                  <p className="whitespace-pre-wrap text-sm">{contact.message}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() =>
                        markReadMut.mutate({
                          id: contact.id,
                          isRead: !contact.isRead,
                        })
                      }
                      className="text-xs text-slate-500 hover:text-accent"
                    >
                      Mark as {contact.isRead ? 'unread' : 'read'}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this message?'))
                          deleteMut.mutate(contact.id)
                      }}
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
