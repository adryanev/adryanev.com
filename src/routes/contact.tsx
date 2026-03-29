import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Send, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { submitContact } from '@/server/functions/public.functions'
import { Reveal } from '@/components/motion/Reveal'
import { seoMeta, canonicalLink } from '@/lib/seo'

export const Route = createFileRoute('/contact')({
  component: ContactPage,
  head: () => ({
    meta: seoMeta({
      title: 'Contact — Adryan Eka Vandra',
      description: 'Get in touch with Adryan Eka Vandra.',
      path: '/contact',
    }),
    links: [canonicalLink('/contact')],
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
      setSubmitted(true)
    },
    onError: (err) => {
      setFieldErrors({ form: err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.' })
    },
  })

  if (submitted) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-24 md:py-32">
        <Reveal>
          <div className="brutal-border brutal-shadow-lg bg-bg-secondary p-12 text-center">
            <CheckCircle className="mx-auto h-20 w-20 text-accent mb-8" />
            <h1 className="font-serif text-5xl font-bold italic text-text-primary mb-4">Message Sent</h1>
            <p className="font-sans text-lg text-text-secondary">
              Thanks for reaching out. I'll review your message and respond shortly.
            </p>
          </div>
        </Reveal>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 md:py-24">
      <Reveal>
        <div className="mb-16 border-b-4 border-text-primary pb-8">
          <h1 className="font-serif text-6xl font-medium tracking-tight md:text-8xl lg:text-[10rem] uppercase">
            Contact
          </h1>
          <div className="mt-8 flex items-center gap-4">
            <div className="h-4 w-4 bg-accent brutal-border" />
            <span className="font-mono text-sm text-text-secondary tracking-wider">
              Get in Touch
            </span>
          </div>
        </div>
      </Reveal>

      <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
        <Reveal delay={0.1}>
          <div>
            <p className="font-serif text-3xl leading-relaxed text-text-primary md:text-5xl italic mb-8">
              Have a project in mind or just want to say hello? <br />
              <span className="text-accent underline decoration-4 underline-offset-8">Let's talk.</span>
            </p>

            <div className="space-y-6 mt-12 font-mono text-lg">
              <div className="flex flex-col gap-2">
                <span className="text-sm text-text-secondary tracking-wider">Email</span>
                <a href="mailto:me@adryanev.com" className="font-bold text-text-primary hover:text-accent transition-colors">
                  me@adryanev.com
                </a>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm text-text-secondary tracking-wider">Links</span>
                <div className="flex gap-4 font-bold">
                  <a href="https://github.com/adryanev" target="_blank" rel="noreferrer" className="underline decoration-2 hover:text-accent transition-colors">GitHub</a>
                  <a href="https://linkedin.com/in/adryanev" target="_blank" rel="noreferrer" className="underline decoration-2 hover:text-accent transition-colors">LinkedIn</a>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (mutation.isPending) return
              setFieldErrors({})
              mutation.mutate()
            }}
            className="brutal-border md:brutal-shadow-lg bg-bg-secondary p-8 md:p-12 space-y-8"
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

            <div className="space-y-2">
              <label htmlFor="name" className="font-mono text-sm text-text-primary tracking-wider">
                Name <span className="text-accent">*</span>
              </label>
              <input
                type="text"
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className={cn(
                  'w-full brutal-border bg-bg-primary px-4 py-4 font-sans text-lg outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent transition-all',
                  fieldErrors.name && 'border-red-500'
                )}
                placeholder="Your Name…"
              />
              {fieldErrors.name && (
                <p className="mt-1 font-mono text-xs text-red-500">{fieldErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="font-mono text-sm text-text-primary tracking-wider">
                Email <span className="text-accent">*</span>
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                spellCheck={false}
                className={cn(
                  'w-full brutal-border bg-bg-primary px-4 py-4 font-sans text-lg outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent transition-all',
                  fieldErrors.email && 'border-red-500'
                )}
                placeholder="you@domain.com…"
              />
              {fieldErrors.email && (
                <p className="mt-1 font-mono text-xs text-red-500">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="subject" className="font-mono text-sm text-text-primary tracking-wider">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full brutal-border bg-bg-primary px-4 py-4 font-sans text-lg outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent transition-all"
                placeholder="What is this regarding…"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="font-mono text-sm text-text-primary tracking-wider">
                Message <span className="text-accent">*</span>
              </label>
              <textarea
                id="message"
                required
                minLength={10}
                maxLength={5000}
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={cn(
                  'w-full brutal-border bg-bg-primary px-4 py-4 font-sans text-lg resize-none outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent transition-all',
                  fieldErrors.message && 'border-red-500'
                )}
                placeholder="Your message…"
              />
              <div className="mt-1 flex justify-between">
                {fieldErrors.message ? (
                  <p className="font-mono text-xs text-red-500">{fieldErrors.message}</p>
                ) : (
                  <span />
                )}
                <span className="font-mono text-xs text-text-secondary">{message.length}/5000</span>
              </div>
            </div>

            {fieldErrors.form && (
              <div className="p-4 bg-red-500 text-white font-mono text-sm brutal-border">
                Error: {fieldErrors.form}
              </div>
            )}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="group flex w-full items-center justify-center gap-3 bg-text-primary px-8 py-4 font-mono text-lg font-bold uppercase tracking-widest text-bg-primary transition-all hover:bg-accent hover:text-accent-fg brutal-border disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? 'Sending...' : 'Send Message'}
              <Send className="h-5 w-5 transition-transform group-hover:translate-x-2 group-hover:-translate-y-1" />
            </button>
          </form>
        </Reveal>
      </div>
    </div>
  )
}
