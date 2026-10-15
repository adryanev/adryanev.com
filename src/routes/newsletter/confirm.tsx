import { createFileRoute, Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { confirmSubscription } from '@/server/functions/subscribers.functions'

import { PageState, FieldError, Button } from '@/components/ui'
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
  const failed =
    mutation.data && 'error' in mutation.data ? mutation.data.error : null
  const confirmed =
    mutation.data && 'success' in mutation.data && mutation.data.success
  return (
    <PageState aria-live="polite">
      <h1>
        {!token
          ? 'Confirmation link incomplete'
          : confirmed
            ? 'Subscription confirmed'
            : failed
              ? 'Confirmation failed'
              : 'Confirm your subscription'}
      </h1>
      <p>
        {!token
          ? 'Open the complete confirmation link from your email.'
          : confirmed
            ? 'You will receive an email when a new article is published.'
            : failed ||
              'Confirm that you want to receive new articles by email.'}
      </p>
      {mutation.isError && (
        <FieldError role="alert">
          Confirmation could not reach the server. Please try again.
        </FieldError>
      )}
      <div className="page-actions">
        {!!token && !confirmed && !failed && (
          <Button
            variant="primary"
            size="lg"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? 'Confirming…' : 'Confirm subscription'}
          </Button>
        )}
        <Button asChild variant="secondary" size="lg">
          <Link to="/blog" search={{ page: undefined, tag: undefined }}>
            Browse writing
          </Link>
        </Button>
      </div>
    </PageState>
  )
}
