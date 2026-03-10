import { createFileRoute } from '@tanstack/react-router'
import { SaasForm } from '@/components/admin/SaasForm'

export const Route = createFileRoute('/admin/_layout/saas/new')({
  component: () => (
    <div>
      <h1 className="text-2xl font-bold">New SaaS Listing</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Add a new product</p>
      <div className="mt-6"><SaasForm /></div>
    </div>
  ),
})
