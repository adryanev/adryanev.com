import { createFileRoute, Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle, XCircle, Mail } from 'lucide-react'
import { confirmSubscription } from '@/server/functions/subscribers.functions'

export const Route = createFileRoute('/newsletter/confirm')({
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search.token as string) || '',
  }),
  component: ConfirmPage,
  head: () => ({
    meta: [{ title: 'Confirm Subscription — Adryan Eka Vandra' }],
  }),
})

function ConfirmPage() {
  const { token } = Route.useSearch()
  const confirmFn = useServerFn(confirmSubscription)

  const mutation = useMutation({
    mutationFn: () => confirmFn({ data: { token } }),
  })

  if (!token) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <XCircle className="mx-auto h-16 w-16 text-red-500 mb-6" />
        <h1 className="font-serif text-4xl font-bold text-text-primary">Invalid Link</h1>
        <p className="mt-4 font-sans text-text-secondary">
          This confirmation link is missing a token.
        </p>
        <Link to="/blog" search={{ page: undefined, tag: undefined }} className="mt-8 inline-block font-mono text-sm font-bold text-accent hover:underline">
          Back to blog
        </Link>
      </div>
    )
  }

  if (mutation.data && 'error' in mutation.data && mutation.data.error) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <XCircle className="mx-auto h-16 w-16 text-red-500 mb-6" />
        <h1 className="font-serif text-4xl font-bold text-text-primary">Oops</h1>
        <p className="mt-4 font-sans text-text-secondary">{mutation.data.error}</p>
        <Link to="/blog" search={{ page: undefined, tag: undefined }} className="mt-8 inline-block font-mono text-sm font-bold text-accent hover:underline">
          Back to blog
        </Link>
      </div>
    )
  }

  if (mutation.data && 'success' in mutation.data && mutation.data.success) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-accent mb-6" />
        <h1 className="font-serif text-4xl font-bold text-text-primary">Subscribed!</h1>
        <p className="mt-4 font-sans text-text-secondary">
          {'alreadyConfirmed' in mutation.data && mutation.data.alreadyConfirmed
            ? 'You were already confirmed. Welcome back!'
            : 'Your subscription is confirmed. You\'ll get notified when new articles are published.'}
        </p>
        <Link to="/blog" search={{ page: undefined, tag: undefined }} className="mt-8 inline-block font-mono text-sm font-bold text-accent hover:underline">
          Browse the blog
        </Link>
      </div>
    )
  }

  // Default: show confirm button (requires user click)
  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <Mail className="mx-auto h-16 w-16 text-accent mb-6" />
      <h1 className="font-serif text-4xl font-bold text-text-primary">Confirm Your Subscription</h1>
      <p className="mt-4 font-sans text-text-secondary">
        Click the button below to confirm your newsletter subscription.
      </p>
      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="mt-8 inline-flex items-center gap-2 bg-text-primary px-8 py-3 font-mono text-sm font-bold uppercase tracking-widest text-bg-primary transition-all hover:bg-accent hover:text-accent-fg brutal-border disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {mutation.isPending ? 'Confirming...' : 'Confirm Subscription'}
      </button>
    </div>
  )
}
