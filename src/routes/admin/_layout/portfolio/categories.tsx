import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import {
  getCategories,
  createCategory,
  deleteCategory,
} from '@/server/functions/portfolio.functions'

import { FormField } from '@/components/admin/form/FormField'
import { FormInput } from '@/components/admin/form/FormInput'
import { FormError } from '@/components/admin/form/FormError'
export const Route = createFileRoute('/admin/_layout/portfolio/categories')({
  loader: () => getCategories(),
  component: CategoriesPage,
})

function CategoriesPage() {
  const categories = Route.useLoaderData()
  const router = useRouter()
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const createFn = useServerFn(createCategory)
  const deleteFn = useServerFn(deleteCategory)
  const createMut = useMutation({
    mutationFn: () => createFn({ data: { name: newName, description: newDesc || undefined } }),
    onSuccess: () => { setNewName(''); setNewDesc(''); setShowNew(false); void router.invalidate() },
  })
  const deleteMut = useMutation({ mutationFn: (id: number) => deleteFn({ data: { id } }), onSuccess: () => router.invalidate() })
  return <div>
    <header><div><h1>Project categories</h1><p>Organize how visitors browse your work.</p></div><button className="admin-action" onClick={() => setShowNew(!showNew)} aria-expanded={showNew} aria-controls="new-category"><Plus size={18} /> Add category</button></header>
    <FormError message={createMut.isError ? 'Category could not be saved. Check that its name is unique and try again.' : deleteMut.isError ? 'Category could not be deleted. Move its projects to another category first.' : ''} />
    {showNew && <form id="new-category" className="admin-inline-form space-y-5" onSubmit={(event) => { event.preventDefault(); if (!createMut.isPending) createMut.mutate() }}>
      <FormField label="Category name"><FormInput value={newName} onChange={(event) => setNewName(event.target.value)} required autoFocus /></FormField>
      <FormField label="Description" optional><FormInput value={newDesc} onChange={(event) => setNewDesc(event.target.value)} /></FormField>
      <div className="page-actions"><button type="submit" className="admin-action" disabled={!newName.trim() || createMut.isPending}>{createMut.isPending ? 'Saving…' : 'Create category'}</button><button type="button" className="admin-action admin-action--secondary" onClick={() => setShowNew(false)}>Cancel</button></div>
    </form>}
    <div className="admin-records">{categories.map((category) => <article key={category.id}>
      <div><h2>{category.name}</h2><p>/{category.slug} · {category.projects?.length ?? 0} projects · Order {category.sortOrder}</p>{category.description && <p>{category.description}</p>}</div>
      <button aria-label={'Delete ' + category.name} disabled={deleteMut.isPending} onClick={() => { if (confirm('Delete category "' + category.name + '"? It must contain no projects.')) deleteMut.mutate(category.id) }}><Trash2 size={18} /></button>
    </article>)}</div>
    {!categories.length && <section className="page-empty"><h2>Create your first category</h2><p>Projects need a category before they can be published.</p></section>}
  </div>
}
