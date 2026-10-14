import { Link, useRouter } from '@tanstack/react-router'
import { ArrowLeft, RefreshCw } from 'lucide-react'

export function RoutePending() {
  return <div className="route-state" role="status" aria-live="polite">
    <h1>Loading page</h1>
    <p>Getting the latest content.</p>
    <div className="route-state__skeleton" aria-hidden="true"><span /><span /><span /></div>
  </div>
}

export function RouteError({ reset }: { reset: () => void }) {
  const router = useRouter()
  return <div className="route-state" role="alert">
    <h1>This page could not load</h1>
    <p>Check your connection and try again.</p>
    <div className="page-actions">
      <button className="page-button" onClick={() => { void router.invalidate().then(reset) }}><RefreshCw size={18} /> Try again</button>
      <Link className="page-button page-button--quiet" to="/"><ArrowLeft size={18} /> Home</Link>
    </div>
  </div>
}
