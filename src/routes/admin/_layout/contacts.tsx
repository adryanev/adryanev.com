import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { Fragment, useMemo, useState } from 'react'
import { Mail, MailOpen, Reply } from 'lucide-react'
import {
  getContacts,
  markContactRead,
  deleteContact,
} from '@/server/functions/contacts.functions'
import { formatPostDate } from '@/lib/post-dates'
import { groupMessagesByDay } from '@/lib/admin-groups'

import { FormError } from '@/components/ui'
import { DeleteAction, RowAction, RowActions } from '@/components/admin/RowActions'
import {
  AdminBar,
  GroupHeaderRow,
  ListEmpty,
  ListFoot,
  useCollapsedGroups,
} from '@/components/admin/AdminList'

export const Route = createFileRoute('/admin/_layout/contacts')({
  // The clock is read once here so the server render and hydration group the
  // messages under the same day labels
  loader: async () => ({ contacts: await getContacts(), now: Date.now() }),
  component: ContactsPage,
})

const COLUMNS = 5

const firstLine = (text: string) =>
  text.split('\n').find((line) => line.trim())?.trim() ?? ''

const receivedTime = (date: Date) =>
  date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }) + ' UTC'

function ContactsPage() {
  const { contacts, now } = Route.useLoaderData()
  const router = useRouter()
  const [filter, setFilter] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const groups = useCollapsedGroups()
  const markReadFn = useServerFn(markContactRead)
  const deleteFn = useServerFn(deleteContact)
  const markReadMut = useMutation({
    mutationFn: (data: { id: number; isRead: boolean }) => markReadFn({ data }),
    onSuccess: () => router.invalidate(),
  })
  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteFn({ data: { id } }),
    onSuccess: () => router.invalidate(),
  })

  const unread = contacts.filter((contact) => !contact.isRead).length
  const query = filter.trim().toLowerCase()
  const dayGroups = useMemo(
    () =>
      groupMessagesByDay(
        contacts.filter((contact) =>
          [contact.name, contact.email, contact.subject ?? '', contact.message]
            .join(' ')
            .toLowerCase()
            .includes(query),
        ),
        now,
      ),
    [contacts, query, now],
  )

  const toggleMessage = (contact: (typeof contacts)[number]) => {
    setExpandedId(expandedId === contact.id ? null : contact.id)
    if (!contact.isRead) markReadMut.mutate({ id: contact.id, isRead: true })
  }

  return (
    <section className="admin-screen">
      <AdminBar
        title="Messages"
        count={contacts.length}
        filter={
          contacts.length > 0
            ? { value: filter, onChange: setFilter, label: 'Filter messages' }
            : undefined
        }
      />
      <FormError
        message={
          markReadMut.isError || deleteMut.isError
            ? 'The message could not be updated. Please try again.'
            : ''
        }
      />
      {contacts.length === 0 ? (
        <ListEmpty icon={Mail} title="No messages">
          Messages sent through the contact form land here.
        </ListEmpty>
      ) : dayGroups.length === 0 ? (
        <p className="admin-no-match">No messages match “{filter.trim()}”.</p>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-table__dot">
                  <span className="sr-only">Unread</span>
                </th>
                <th>From</th>
                <th>Message</th>
                <th data-optional>Received</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            {dayGroups.map((group) => {
              const open = groups.isOpen(group.key)
              return (
                <tbody key={group.key}>
                  <GroupHeaderRow
                    id={'day-' + group.key}
                    label={group.label}
                    count={group.rows.length}
                    colSpan={COLUMNS}
                    open={open}
                    onToggle={() => groups.toggle(group.key)}
                  />
                  {open &&
                    group.rows.map((contact) => {
                      const expanded = expandedId === contact.id
                      const created = new Date(contact.createdAt)
                      return (
                        <Fragment key={contact.id}>
                          <tr data-unread={!contact.isRead || undefined}>
                            <td className="admin-table__dot">
                              {!contact.isRead && (
                                <span className="admin-dot" role="img" aria-label="Unread" />
                              )}
                            </td>
                            <td className="admin-table__from">{contact.name}</td>
                            <td className="admin-table__preview">
                              <button
                                type="button"
                                aria-expanded={expanded}
                                aria-controls={'message-' + contact.id}
                                onClick={() => toggleMessage(contact)}
                              >
                                <b>{contact.subject || firstLine(contact.message)}</b>
                                {contact.subject && <> — {firstLine(contact.message)}</>}
                              </button>
                            </td>
                            <td className="is-muted" data-optional>
                              {receivedTime(created)}
                            </td>
                            <td>
                              <RowActions>
                                <RowAction asChild label={'Reply to ' + contact.name}>
                                  <a href={'mailto:' + contact.email}>
                                    <Reply size={15} aria-hidden="true" />
                                  </a>
                                </RowAction>
                                <RowAction
                                  label={`Mark message from ${contact.name} ${contact.isRead ? 'unread' : 'read'}`}
                                  disabled={markReadMut.isPending}
                                  onClick={() =>
                                    markReadMut.mutate({
                                      id: contact.id,
                                      isRead: !contact.isRead,
                                    })
                                  }
                                >
                                  {contact.isRead ? (
                                    <Mail size={15} aria-hidden="true" />
                                  ) : (
                                    <MailOpen size={15} aria-hidden="true" />
                                  )}
                                </RowAction>
                                <DeleteAction
                                  label={'Delete message from ' + contact.name}
                                  pending={deleteMut.isPending}
                                  onConfirm={() => deleteMut.mutate(contact.id)}
                                />
                              </RowActions>
                            </td>
                          </tr>
                          {expanded && (
                            <tr className="admin-table__detail" id={'message-' + contact.id}>
                              <td />
                              <td colSpan={COLUMNS - 1}>
                                <p className="admin-message__meta">
                                  <a href={'mailto:' + contact.email}>{contact.email}</a>
                                  {' · '}
                                  {formatPostDate(created)}, {receivedTime(created)}
                                </p>
                                <p className="admin-message__text">{contact.message}</p>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      )
                    })}
                </tbody>
              )
            })}
          </table>
        </div>
      )}
      {contacts.length > 0 && <ListFoot>{unread} unread · grouped by day (UTC)</ListFoot>}
    </section>
  )
}
