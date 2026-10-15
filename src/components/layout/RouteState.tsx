import { Link, useRouter } from '@tanstack/react-router'
import { ArrowLeft, RefreshCw } from 'lucide-react'

import { PageState, Button } from '@/components/ui'

export function RoutePending() {
  return (
    <PageState role="status" aria-live="polite">
      <h1>Loading page</h1>
      <p>Getting the latest content.</p>
      <div className="route-state__skeleton" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </PageState>
  )
}

export function RouteError({ reset }: { reset: () => void }) {
  const router = useRouter()
  return (
    <PageState role="alert">
      <h1>This page could not load</h1>
      <p>Check your connection and try again.</p>
      <div className="page-actions">
        <Button
          variant="primary"
          size="lg"
          onClick={() => {
            void router.invalidate().then(reset)
          }}
        >
          <RefreshCw size={18} /> Try again
        </Button>
        <Button asChild variant="secondary" size="lg">
          <Link to="/">
            <ArrowLeft size={18} /> Home
          </Link>
        </Button>
      </div>
    </PageState>
  )
}
