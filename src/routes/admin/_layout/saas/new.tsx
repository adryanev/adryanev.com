import { createFileRoute } from '@tanstack/react-router'
import { SaasForm } from '@/components/admin/SaasForm'

import { PageHeader } from '@/components/ui'
export const Route = createFileRoute('/admin/_layout/saas/new')({
  component: () => (
    <div>
      <PageHeader>
        <div>
          <h1 className="text-2xl font-bold">New SaaS Listing</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Add a new product
          </p>
        </div>
      </PageHeader>
      <div className="mt-6">
        <SaasForm />
      </div>
    </div>
  ),
})
