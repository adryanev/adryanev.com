import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Send, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { submitContact } from '@/server/functions/public.functions'

export const Route = createFileRoute('/contact')({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: 'Contact — Adryan Eka Vandra' },
      {
        name: 'description',
        content: 'Get in touch with Adryan Eka Vandra.',
      },
    ],
  }),
})

function ContactPage() {
  const submitFn = useServerFn(submitContact)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const mutation = useMutation({
    mutationFn: () =>
      submitFn({ data: { name, email, subject, message, honeypot } }),
    onSuccess: (result) => {
      if (result && 'errors' in result) {
        setFieldErrors(result.errors as Record<string, string>)
        return
      }
      if (result && 'error' in result) {
        setFieldErrors({ form: result.error as string })
        return
      }
      setSubmitted(true)
    },
  })

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <CheckCircle className="mx-auto h-12 w-12 text-accent" />
        <h1 className="mt-4 text-2xl font-bold">Message sent!</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Thanks for reaching out. I'll get back to you soon.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold">Contact</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Have a question or want to work together? Drop me a message.
      </p>

      <form
        className="mt-8 space-y-5"
        onSubmit={(e) => {
          e.preventDefault()
          setFieldErrors({})
          mutation.mutate()
        }}
      >
        {/* Honeypot — hidden from real users */}
        <div className="absolute -left-[9999px] top-0" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={cn(
              'mt-1 w-full rounded-md border px-3 py-2 text-sm transition-colors',
              'border-slate-300 bg-white focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none',
              'dark:border-slate-700 dark:bg-slate-900 dark:focus:border-accent',
              fieldErrors.name && 'border-red-500',
            )}
          />
          {fieldErrors.name && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={cn(
              'mt-1 w-full rounded-md border px-3 py-2 text-sm transition-colors',
              'border-slate-300 bg-white focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none',
              'dark:border-slate-700 dark:bg-slate-900 dark:focus:border-accent',
              fieldErrors.email && 'border-red-500',
            )}
          />
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium">
            Subject
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={cn(
              'mt-1 w-full rounded-md border px-3 py-2 text-sm transition-colors',
              'border-slate-300 bg-white focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none',
              'dark:border-slate-700 dark:bg-slate-900 dark:focus:border-accent',
            )}
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            required
            rows={6}
            minLength={10}
            maxLength={5000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={cn(
              'mt-1 w-full rounded-md border px-3 py-2 text-sm transition-colors resize-none',
              'border-slate-300 bg-white focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none',
              'dark:border-slate-700 dark:bg-slate-900 dark:focus:border-accent',
              fieldErrors.message && 'border-red-500',
            )}
          />
          <div className="mt-1 flex justify-between">
            {fieldErrors.message ? (
              <p className="text-xs text-red-500">{fieldErrors.message}</p>
            ) : (
              <span />
            )}
            <span className="text-xs text-slate-400">{message.length}/5000</span>
          </div>
        </div>

        {fieldErrors.form && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {fieldErrors.form}
          </p>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className={cn(
            'inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium transition-colors',
            'bg-accent text-slate-950 hover:bg-accent-hover',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          <Send className="h-4 w-4" />
          {mutation.isPending ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  )
}
