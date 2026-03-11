import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { LogIn } from 'lucide-react'
import { cn } from '@/lib/utils'
import { login, getCurrentUser } from '@/server/functions/auth.functions'

export const Route = createFileRoute('/admin/login')({
  beforeLoad: async () => {
    // If already logged in, redirect to admin dashboard
    const user = await getCurrentUser()
    if (user) {
      throw redirect({ to: '/admin' })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const loginFn = useServerFn(login)
  const loginMutation = useMutation({
    mutationFn: () => loginFn({ data: { email, password } }),
    onSuccess: () => {
      navigate({ to: '/admin' })
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    loginMutation.mutate()
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div
        className={cn(
          'w-full max-w-sm rounded-lg border p-8',
          'border-slate-200 bg-white',
          'dark:border-slate-800 dark:bg-slate-900',
        )}
      >
        <div className="mb-8 text-center">
          <p className="font-mono text-sm text-accent">admin@adryanev.com</p>
          <h1 className="mt-2 text-2xl font-bold">Sign In</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Enter your credentials to access the admin panel
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              className={cn(
                'rounded-md border px-4 py-3 text-sm',
                'border-red-200 bg-red-50 text-red-700',
                'dark:border-red-900 dark:bg-red-950 dark:text-red-400',
              )}
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={cn(
                'w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors',
                'border-slate-300 bg-white focus:border-accent focus:ring-1 focus:ring-accent',
                'dark:border-slate-700 dark:bg-slate-800 dark:focus:border-accent dark:focus:ring-accent',
              )}
              placeholder="admin@adryanev.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className={cn(
                'w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors',
                'border-slate-300 bg-white focus:border-accent focus:ring-1 focus:ring-accent',
                'dark:border-slate-700 dark:bg-slate-800 dark:focus:border-accent dark:focus:ring-accent',
              )}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors',
              'bg-accent text-slate-950 hover:bg-accent-hover',
              'disabled:cursor-not-allowed disabled:opacity-60',
            )}
          >
            {loginMutation.isPending ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
