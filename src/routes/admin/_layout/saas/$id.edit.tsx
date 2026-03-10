import { createFileRoute } from '@tanstack/react-router'
import { SaasForm } from '@/components/admin/SaasForm'
import { getSaasById } from '@/server/functions/saas.functions'

export const Route = createFileRoute('/admin/_layout/saas/$id/edit')({
  loader: ({ params }) => getSaasById({ data: { id: Number(params.id) } }),
  component: EditSaasPage,
})

function EditSaasPage() {
  const listing = Route.useLoaderData()
  if (!listing) return <div className="py-12 text-center text-slate-500">Listing not found</div>

  return (
    <div>
      <h1 className="text-2xl font-bold">Edit SaaS Listing</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Editing: {listing.name}</p>
      <div className="mt-6">
        <SaasForm initial={{
          id: listing.id,
          name: listing.name,
          slug: listing.slug,
          description: listing.description,
          url: listing.url ?? '',
          githubUrl: listing.githubUrl ?? '',
          logoUrl: listing.logoUrl ?? '',
          technology: listing.technology,
          status: listing.status,
          sortOrder: listing.sortOrder,
        }} />
      </div>
    </div>
  )
}
