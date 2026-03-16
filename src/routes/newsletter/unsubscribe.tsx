import { createFileRoute, Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle, XCircle } from 'lucide-react'
import { unsubscribe } from '@/server/functions/subscribers.functions'

export const Route = createFileRoute('/newsletter/unsubscribe')({
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search.token as string) || '',
  }),
  component: UnsubscribePage,
  head: () => ({
    meta: [{ title: 'Unsubscribe — Adryan Eka Vandra' }],
  }),
})

function UnsubscribePage() {
  const { token } = Route.useSearch()
  const unsubscribeFn = useServerFn(unsubscribe)

  const mutation = useMutation({
    mutationFn: () => unsubscribeFn({ data: { token } }),
  })

  if (!token) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <XCircle className="mx-auto h-16 w-16 text-red-500 mb-6" />
        <h1 className="font-serif text-4xl font-bold text-text-primary">Invalid Link</h1>
        <p className="mt-4 font-sans text-text-secondary">
          This unsubscribe link is missing a token.
        </p>
      </div>
    )
  }

  if (mutation.isSuccess) {
    const data = mutation.data
    if (data && 'error' in data && data.error) {
      return (
        <div className="mx-auto max-w-xl px-6 py-24 text-center">
          <XCircle className="mx-auto h-16 w-16 text-red-500 mb-6" />
          <h1 className="font-serif text-4xl font-bold text-text-primary">Oops</h1>
          <p className="mt-4 font-sans text-text-secondary">{data.error}</p>
        </div>
      )
    }

    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-accent mb-6" />
        <h1 className="font-serif text-4xl font-bold text-text-primary">Unsubscribed</h1>
        <p className="mt-4 font-sans text-text-secondary">
          {data && 'alreadyUnsubscribed' in data && data.alreadyUnsubscribed
            ? 'You were already unsubscribed.'
            : 'You\'ve been removed from the mailing list. Sorry to see you go!'}
        </p>
        <Link to="/blog" search={{ page: undefined, tag: undefined }} className="mt-8 inline-block font-mono text-sm font-bold text-accent hover:underline">
          Browse the blog
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="font-serif text-4xl font-bold text-text-primary mb-4">Unsubscribe?</h1>
      <p className="font-sans text-text-secondary mb-8">
        Are you sure you want to stop receiving new article notifications?
      </p>
      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="bg-text-primary px-8 py-3 font-mono text-sm font-bold uppercase tracking-widest text-bg-primary transition-all hover:bg-accent hover:text-accent-fg brutal-border disabled:opacity-50"
      >
        {mutation.isPending ? 'Processing...' : 'Yes, Unsubscribe'}
      </button>
    </div>
  )
}
