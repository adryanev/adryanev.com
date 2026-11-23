import { useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { Save } from 'lucide-react'
import type { portfolioCategories } from '@/db/schema/portfolio'
import {
  createCategory,
  updateCategory,
} from '@/server/functions/portfolio.functions'
import { Button, Field, FormError, Input } from '@/components/ui'
import { SlugInput } from './SlugInput'

export type Category = typeof portfolioCategories.$inferSelect

// A blank slug asks the server to derive it from the name
type CategoryDraft = Pick<Category, 'name' | 'slug'> & { description: string }

export function CategoryForm({
  id,
  category,
  onSaved,
  onCancel,
}: {
  id: string
  category?: Category
  onSaved: (categoryId: number) => Promise<void>
  onCancel: () => void
}) {
  const [draft, setDraft] = useState<CategoryDraft>({
    name: category?.name ?? '',
    slug: category?.slug ?? '',
    description: category?.description ?? '',
  })
  const createFn = useServerFn(createCategory)
  const updateFn = useServerFn(updateCategory)
  const save = useMutation({
    mutationFn: async () => {
      const data = {
        name: draft.name.trim(),
        slug: draft.slug.trim() || undefined,
        description: draft.description.trim() || undefined,
      }
      if (!category) return (await createFn({ data })).id
      await updateFn({ data: { ...data, id: category.id } })
      return category.id
    },
    onSuccess: onSaved,
  })

  return (
    <form
      id={id}
      className="admin-inline-form space-y-5"
      aria-label={category ? 'Edit ' + category.name : 'New category'}
      onSubmit={(event) => {
        event.preventDefault()
        if (!save.isPending) save.mutate()
      }}
    >
      <FormError
        message={
          save.isError
            ? 'The category could not be saved. Its slug may already be in use.'
            : ''
        }
      />
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Category name">
          <Input
            value={draft.name}
            onChange={(event) =>
              setDraft({ ...draft, name: event.target.value })
            }
            required
            autoFocus
          />
        </Field>
        <SlugInput
          title={draft.name}
          value={draft.slug}
          onChange={(slug) => setDraft({ ...draft, slug })}
        />
      </div>
      <Field label="Description" optional>
        <Input
          value={draft.description}
          onChange={(event) =>
            setDraft({ ...draft, description: event.target.value })
          }
        />
      </Field>
      <div className="page-actions">
        <Button
          variant="primary"
          type="submit"
          disabled={!draft.name.trim() || save.isPending}
        >
          <Save size={18} aria-hidden="true" />
          {save.isPending
            ? 'Saving…'
            : category
              ? 'Save changes'
              : 'Create category'}
        </Button>
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
