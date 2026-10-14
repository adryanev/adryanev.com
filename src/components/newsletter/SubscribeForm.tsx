import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { subscribe } from '@/server/functions/subscribers.functions'

import { useId } from 'react'

export function SubscribeForm({ className }: { className?: string }) {
  const subscribeFn = useServerFn(subscribe)
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [state, setState] = useState<'idle' | 'success'>('idle')
  const [error, setError] = useState<string | null>(null)
  const id = useId()
  const mutation = useMutation({
    mutationFn: () => subscribeFn({ data: { email, honeypot } }),
    onSuccess: (result) => {
      if (result && 'error' in result && result.error) { setError(result.error); return }
      setState('success')
    },
    onError: () => setError('Subscription could not be saved. Check your connection and try again.'),
  })
  if (state === 'success') return <section className={cn('newsletter-panel', className)} role="status">
    <CheckCircle className="mb-4" size={32} aria-hidden="true" /><h2>Check your inbox</h2>
    <p>Click the confirmation link in your email to complete your subscription.</p>
  </section>
  return <section className={cn('newsletter-panel', className)} aria-labelledby={id + '-title'}>
    <h2 id={id + '-title'}>New writing, by email</h2>
    <p>Get notified when I publish an article. Unsubscribe whenever you like.</p>
    <form onSubmit={(event) => { event.preventDefault(); if (!mutation.isPending) { setError(null); mutation.mutate() } }}>
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor={id + '-website'}>Website</label>
        <input id={id + '-website'} name="website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} />
      </div>
      <div className="newsletter-panel__field">
        <label htmlFor={id + '-email'}>Email address</label>
        <input id={id + '-email'} type="email" required autoComplete="email" spellCheck={false} value={email}
          aria-invalid={!!error} aria-describedby={error ? id + '-error' : undefined}
          onChange={(event) => setEmail(event.target.value)} placeholder="you@domain.com" />
      </div>
      <button className="page-button" type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Subscribing…' : 'Subscribe'}<ArrowRight size={18} aria-hidden="true" /></button>
    </form>
    {error && <p id={id + '-error'} className="field-error" role="alert">{error}</p>}
  </section>
}
