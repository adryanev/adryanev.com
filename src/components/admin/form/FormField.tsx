import type { ReactNode } from 'react'

import { useId } from 'react'
import { FieldContext } from './FieldContext'

export function FormField({ label, htmlFor, optional, children }: {
  label: string; htmlFor?: string; optional?: boolean; children: ReactNode
}) {
  const generated = useId()
  const id = htmlFor ?? generated
  const labelId = id + '-label'
  return <FieldContext.Provider value={{ id, labelId }}>
    <div className="admin-field" role="group" aria-labelledby={labelId}>
      <label id={labelId} htmlFor={id} className="admin-field__label">{label}{optional && <span className="admin-field__optional">(optional)</span>}</label>
      {children}
    </div>
  </FieldContext.Provider>
}
