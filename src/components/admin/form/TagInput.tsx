import { useState, useCallback, createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { FormInput } from './FormInput'

interface TagInputContextValue {
  tags: string[]
  inputValue: string
  setInputValue: (value: string) => void
  addTag: () => void
  removeTag: (tag: string) => void
}

const TagInputContext = createContext<TagInputContextValue | null>(null)

function useTagInputContext() {
  const ctx = useContext(TagInputContext)
  if (!ctx) throw new Error('TagInput compound components must be used within TagInput.Root')
  return ctx
}

function Root({
  value,
  onChange,
  children,
}: {
  value: string[]
  onChange: (tags: string[]) => void
  children: ReactNode
}) {
  const [inputValue, setInputValue] = useState('')

  const addTag = useCallback(() => {
    const trimmed = inputValue.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
    }
    setInputValue('')
  }, [inputValue, value, onChange])

  const removeTag = useCallback(
    (tag: string) => onChange(value.filter((t) => t !== tag)),
    [value, onChange],
  )

  return (
    <TagInputContext.Provider value={{ tags: value, inputValue, setInputValue, addTag, removeTag }}>
      {children}
    </TagInputContext.Provider>
  )
}

function Input({ placeholder = 'Add tag...' }: { placeholder?: string }) {
  const { inputValue, setInputValue, addTag } = useTagInputContext()

  return (
    <div className="flex gap-2">
      <FormInput
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            addTag()
          }
        }}
        className="flex-1"
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={addTag}
        className="border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-2 text-xs font-semibold uppercase text-[var(--text-primary)] hover:bg-[var(--bg-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
      >
        Add
      </button>
    </div>
  )
}

function List() {
  const { tags, removeTag } = useTagInputContext()

  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {tags.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 border border-[var(--accent)] bg-[var(--accent)]/10 px-2 py-1 text-xs text-[var(--accent)]"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            aria-label={`Remove ${tag}`}
            className="hover:text-red-500 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  )
}

export const TagInput = { Root, Input, List }
