import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Mail, CheckCircle, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { subscribe } from '@/server/functions/subscribers.functions'

export function SubscribeForm({ className }: { className?: string }) {
  const subscribeFn = useServerFn(subscribe)

  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [state, setState] = useState<'idle' | 'success'>('idle')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => subscribeFn({ data: { email, honeypot } }),
    onSuccess: (result) => {
      if (result && 'error' in result && result.error) {
        setError(result.error)
        return
      }
      setState('success')
    },
    onError: (err) => {
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      )
    },
  })

  if (state === 'success') {
    return (
      <div className={cn('brutal-border bg-bg-secondary p-8 text-center', className)}>
        <CheckCircle className="mx-auto h-10 w-10 text-accent mb-4" />
        <p className="font-serif text-2xl font-bold text-text-primary">You're in!</p>
        <p className="mt-2 font-sans text-sm text-text-secondary">
          Check your inbox and click the confirmation link to complete your subscription.
        </p>
      </div>
    )
  }

  return (
    <div className={cn('brutal-border bg-bg-secondary p-8', className)}>
      <div className="flex items-center gap-3 mb-4">
        <Mail className="h-5 w-5 text-accent" />
        <h3 className="font-serif text-2xl font-bold text-text-primary">
          Stay in the loop
        </h3>
      </div>
      <p className="font-sans text-sm text-text-secondary mb-6">
        Get notified when I publish new articles. No spam, unsubscribe anytime.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (mutation.isPending) return
          setError(null)
          mutation.mutate()
        }}
        className="flex flex-col sm:flex-row gap-3"
      >
        {/* Honeypot */}
        <div className="absolute -left-[9999px] top-0" aria-hidden="true">
          <label htmlFor="hp-website">Website</label>
          <input
            id="hp-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          spellCheck={false}
          placeholder="you@domain.com"
          className="flex-1 brutal-border bg-bg-primary px-4 py-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent transition-all"
        />
        <button
          type="submit"
          disabled={mutation.isPending}
          className="group flex items-center justify-center gap-2 bg-text-primary px-6 py-3 font-mono text-sm font-bold uppercase tracking-widest text-bg-primary transition-all hover:bg-accent hover:text-accent-fg brutal-border disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {mutation.isPending ? 'Subscribing...' : 'Subscribe'}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </form>

      {error && (
        <p className="mt-3 font-mono text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}
