import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Plus, Save, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getCategories,
  createCategory,
  deleteCategory,
} from '@/server/functions/portfolio.functions'

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
    mutationFn: () =>
      createFn({
        data: { name: newName, description: newDesc || undefined },
      }),
    onSuccess: () => {
      setNewName('')
      setNewDesc('')
      setShowNew(false)
      router.invalidate()
    },
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteFn({ data: { id } }),
    onSuccess: () => router.invalidate(),
  })

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage portfolio categories
          </p>
        </div>
        <button
          onClick={() => setShowNew(!showNew)}
          className={cn(
            'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium',
            'bg-accent text-slate-950 hover:bg-accent-hover',
          )}
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {showNew && (
        <div className="mt-4 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <div className="space-y-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Category name"
              className={cn(
                'w-full rounded-md border px-3 py-2 text-sm outline-none',
                'border-slate-300 bg-white focus:border-accent',
                'dark:border-slate-700 dark:bg-slate-800',
              )}
            />
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Description (optional)"
              className={cn(
                'w-full rounded-md border px-3 py-2 text-sm outline-none',
                'border-slate-300 bg-white focus:border-accent',
                'dark:border-slate-700 dark:bg-slate-800',
              )}
            />
            <div className="flex gap-2">
              <button
                onClick={() => createMut.mutate()}
                disabled={!newName.trim() || createMut.isPending}
                className="flex items-center gap-2 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-slate-950 disabled:opacity-60"
              >
                <Save className="h-3 w-3" />
                Save
              </button>
              <button
                onClick={() => setShowNew(false)}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-800"
          >
            <div>
              <p className="font-medium">{cat.name}</p>
              <p className="text-xs text-slate-500">
                /{cat.slug} — {cat.projects?.length ?? 0} projects — order: {cat.sortOrder}
              </p>
              {cat.description && (
                <p className="mt-0.5 text-xs text-slate-400">{cat.description}</p>
              )}
            </div>
            <button
              onClick={() => {
                if (confirm(`Delete category "${cat.name}"? This will fail if it has projects.`))
                  deleteMut.mutate(cat.id)
              }}
              className="rounded p-1 text-slate-400 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
