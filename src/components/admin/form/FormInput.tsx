import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

import { useContext } from 'react'
import { FieldContext } from './FieldContext'
export const FormInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, id, ...props }, ref) => {
    const field = useContext(FieldContext)
    return <input ref={ref} id={id ?? field?.id} className={cn('admin-form-control', className)} {...props} />
  },
)

FormInput.displayName = 'FormInput'
