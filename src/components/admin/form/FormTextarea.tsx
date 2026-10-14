import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

import { useContext } from 'react'
import { FieldContext } from './FieldContext'
export const FormTextarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, id, ...props }, ref) => {
    const field = useContext(FieldContext)
    return <textarea ref={ref} id={id ?? field?.id} className={cn('admin-form-control', className)} {...props} />
  },
)

FormTextarea.displayName = 'FormTextarea'
