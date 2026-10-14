import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

import { useContext } from 'react'
import { FieldContext } from './FieldContext'
export const FormSelect = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, id, children, ...props }, ref) => {
    const field = useContext(FieldContext)
    return <select ref={ref} id={id ?? field?.id} className={cn('admin-form-control', className)} {...props}>{children}</select>
  },
)

FormSelect.displayName = 'FormSelect'
