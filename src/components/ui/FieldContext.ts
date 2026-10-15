import { createContext } from 'react'

export const FieldContext = createContext<{
  id: string
  labelId: string
  descriptionId?: string
  invalid?: boolean
} | null>(null)
