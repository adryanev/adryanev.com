import { createFileRoute } from '@tanstack/react-router'
import { getDashboardStats } from '@/server/functions/dashboard.functions'
import { getViewAnalytics } from '@/server/functions/views.functions'
import { getSubscriberStats } from '@/server/functions/subscribers.functions'

import { DashboardOverview, DashboardPending } from '@/components/admin/DashboardOverview'
export const Route = createFileRoute('/admin/_layout/')({
  loader: async () => {
    const [stats, analytics, subscriberStats] = await Promise.all([
      getDashboardStats(),
      getViewAnalytics(),
      getSubscriberStats(),
    ])
    return { stats, analytics, subscriberStats }
  },
  component: DashboardPage,
  pendingComponent: DashboardPending,
})

function DashboardPage() {
  return <DashboardOverview {...Route.useLoaderData()} />
}
