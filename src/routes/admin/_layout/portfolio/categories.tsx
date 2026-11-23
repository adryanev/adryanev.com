import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import {
  getCategories,
  deleteCategory,
  reorderCategories,
} from '@/server/functions/portfolio.functions'
import { useTransient } from '@/hooks/useTransient'
import { usePersistedOrder } from '@/hooks/usePersistedOrder'
import { FormError, PageHeader, Button, EmptyState } from '@/components/ui'
import { CategoryForm } from '@/components/admin/CategoryForm'
import { DeleteAction, RowAction, RowActions } from '@/components/admin/RowActions'
import { OrderStatusNotice, SortableList } from '@/components/admin/SortableList'
import { Reveal } from '@/components/admin/motion'

export const Route = createFileRoute('/admin/_layout/portfolio/categories')({
  loader: () => getCategories(),
  component: CategoriesPage,
})

const HIGHLIGHT_MS = 1600
const NOTICE_MS = 3000

type OpenForm = { kind: 'create' } | { kind: 'edit'; id: number } | null

function CategoriesPage() {
  const categories = Route.useLoaderData()
  const router = useRouter()
  const [openForm, setOpenForm] = useState<OpenForm>(null)
  const [highlightId, highlight] = useTransient<number>(HIGHLIGHT_MS)
  const [notice, showNotice] = useTransient<string>(NOTICE_MS)
  const reorderFn = useServerFn(reorderCategories)
  const order = usePersistedOrder(categories, (ids) =>
    reorderFn({ data: { ids } }),
  )
  const deleteFn = useServerFn(deleteCategory)
  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteFn({ data: { id } }),
    onSuccess: () => router.invalidate(),
  })

  const saved = (message: string) => async (id: number) => {
    await router.invalidate()
    setOpenForm(null)
    highlight(id)
    showNotice(message)
  }

  return (
    <div>
      <PageHeader>
        <div>
          <h1>Project categories</h1>
          <p>Organize how visitors browse your work.</p>
        </div>
        <Button
          variant="primary"
          onClick={() =>
            setOpenForm(openForm?.kind === 'create' ? null : { kind: 'create' })
          }
          aria-expanded={openForm?.kind === 'create'}
          aria-controls="category-new"
        >
          <Plus size={18} aria-hidden="true" /> Add category
        </Button>
      </PageHeader>
      <div className="admin-section-header">
        <p role="status" className="admin-status">
          {notice}
        </p>
        <OrderStatusNotice status={order.status} />
      </div>
      <FormError
        message={
          deleteMut.isError
            ? 'Category could not be deleted. Move its projects to another category first.'
            : ''
        }
      />
      <Reveal open={openForm?.kind === 'create'}>
        <CategoryForm
          id="category-new"
          onSaved={saved('Category created')}
          onCancel={() => setOpenForm(null)}
        />
      </Reveal>
      <SortableList
        as="div"
        itemAs="article"
        className="admin-records"
        items={order.items}
        getKey={(category) => category.id}
        itemLabel={(category) => category.name}
        onMove={order.move}
        onDrop={order.commit}
        highlightKey={highlightId}
      >
        {(category, handle) => {
          const editing =
            openForm?.kind === 'edit' && openForm.id === category.id
          return (
            <>
              {!editing && (
                <>
                  {handle}
                  <div className="admin-record__body">
                    <h2>{category.name}</h2>
                    <p>
                      /{category.slug} · {category.projects.length}{' '}
                      {category.projects.length === 1 ? 'project' : 'projects'}
                    </p>
                    {category.description && <p>{category.description}</p>}
                  </div>
                  <RowActions>
                    <RowAction
                      label={'Edit ' + category.name}
                      onClick={() =>
                        setOpenForm({ kind: 'edit', id: category.id })
                      }
                    >
                      <Pencil size={16} aria-hidden="true" />
                    </RowAction>
                    <DeleteAction
                      label={'Delete ' + category.name}
                      pending={deleteMut.isPending}
                      onConfirm={() => deleteMut.mutate(category.id)}
                    />
                  </RowActions>
                </>
              )}
              <Reveal open={editing}>
                <CategoryForm
                  id={'category-' + category.id}
                  category={category}
                  onSaved={saved('Category updated')}
                  onCancel={() => setOpenForm(null)}
                />
              </Reveal>
            </>
          )
        }}
      </SortableList>
      {!categories.length && (
        <EmptyState>
          <h2>Create your first category</h2>
          <p>Projects need a category before they can be published.</p>
        </EmptyState>
      )}
    </div>
  )
}
