import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Mail, MailOpen, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { getContacts, markContactRead, deleteContact } from '@/server/functions/contacts.functions'

import { FormError } from '@/components/admin/form/FormError'
export const Route = createFileRoute('/admin/_layout/contacts')({
  loader: () => getContacts(),
  component: ContactsPage,
})

function ContactsPage() {
  const contacts = Route.useLoaderData()
  const router = useRouter()
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const markReadFn = useServerFn(markContactRead)
  const deleteFn = useServerFn(deleteContact)
  const markReadMut = useMutation({ mutationFn: (data: { id: number; isRead: boolean }) => markReadFn({ data }), onSuccess: () => router.invalidate() })
  const deleteMut = useMutation({ mutationFn: (id: number) => deleteFn({ data: { id } }), onSuccess: () => router.invalidate() })
  return <div>
    <header><div><h1>Messages</h1><p>{contacts.filter((contact) => !contact.isRead).length} unread messages</p></div></header>
    <FormError message={markReadMut.isError || deleteMut.isError ? 'The message could not be updated. Please try again.' : ''} />
    {contacts.length === 0 ? <section className="page-empty"><h2>Your inbox is clear</h2><p>Messages from the public contact form appear here.</p></section> :
      <div className="admin-inbox">{contacts.map((contact) => <article key={contact.id} className="admin-message" data-unread={!contact.isRead}>
        <button className="admin-message__summary" aria-expanded={expandedId === contact.id} aria-controls={'message-' + contact.id}
          onClick={() => { setExpandedId(expandedId === contact.id ? null : contact.id); if (!contact.isRead) markReadMut.mutate({ id: contact.id, isRead: true }) }}>
          {contact.isRead ? <MailOpen size={20} aria-hidden="true" /> : <Mail size={20} aria-hidden="true" />}
          <span><strong>{contact.name}</strong><span>{contact.email}</span>{contact.subject && <span>{contact.subject}</span>}</span>
          <span className="admin-message__date">{new Date(contact.createdAt).toLocaleDateString()}{expandedId === contact.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>
        </button>
        {expandedId === contact.id && <div id={'message-' + contact.id} className="admin-message__body">
          <p>{contact.message}</p><div className="page-actions">
            <a className="admin-action admin-action--secondary" href={'mailto:' + contact.email}>Reply by email</a>
            <button className="admin-action admin-action--secondary" disabled={markReadMut.isPending} onClick={() => markReadMut.mutate({ id: contact.id, isRead: !contact.isRead })}>Mark {contact.isRead ? 'unread' : 'read'}</button>
            <button className="admin-action admin-action--secondary" disabled={deleteMut.isPending} onClick={() => { if (confirm('Delete this message from ' + contact.name + '?')) deleteMut.mutate(contact.id) }}><Trash2 size={16} /> Delete</button>
          </div>
        </div>}
      </article>)}</div>}
  </div>
}
