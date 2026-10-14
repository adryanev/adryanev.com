import { AlertTriangle } from 'lucide-react'

export function FormError({ message }: { message: string }) {
  if (!message) return null
  return <div role="alert" className="admin-feedback"><AlertTriangle size={18} aria-hidden="true" /><span>{message}</span></div>
}
