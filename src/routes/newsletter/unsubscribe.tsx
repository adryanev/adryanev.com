import { createFileRoute, Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { unsubscribe } from '@/server/functions/subscribers.functions'

import { PageState, FieldError, Button } from '@/components/ui'
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
  const failed =
    mutation.data && 'error' in mutation.data ? mutation.data.error : null
  const removed = mutation.isSuccess && !failed
  return (
    <PageState aria-live="polite">
      <h1>
        {!token
          ? 'Unsubscribe link incomplete'
          : removed
            ? 'You are unsubscribed'
            : failed
              ? 'Unsubscribe failed'
              : 'Unsubscribe from new articles?'}
      </h1>
      <p>
        {!token
          ? 'Open the complete unsubscribe link from your email.'
          : removed
            ? 'You will no longer receive new article notifications.'
            : failed ||
              'Confirm below to stop receiving article notifications.'}
      </p>
      {mutation.isError && (
        <FieldError role="alert">
          The server could not be reached. Please try again.
        </FieldError>
      )}
      <div className="page-actions">
        {!!token && !removed && !failed && (
          <Button
            variant="primary"
            size="lg"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? 'Unsubscribing…' : 'Unsubscribe'}
          </Button>
        )}
        <Button asChild variant="secondary" size="lg">
          <Link to="/blog" search={{ page: undefined, tag: undefined }}>
            Back to writing
          </Link>
        </Button>
      </div>
    </PageState>
  )
}
