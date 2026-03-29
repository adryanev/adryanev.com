import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Terminal, Lock, Mail, AlertTriangle } from 'lucide-react'
import { login, getCurrentUser } from '@/server/functions/auth.functions'

export const Route = createFileRoute('/admin/login')({
  beforeLoad: async () => {
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
    onError: () => {
      setError('Invalid username or password. Please try again.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    loginMutation.mutate()
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[var(--bg-primary)] font-mono selection:bg-[var(--accent)] selection:text-[var(--accent-fg)] relative">
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="relative w-full max-w-md z-10">
        <div className="border border-[var(--border-color)] bg-[var(--bg-secondary)] p-8 rounded-none shadow-sm">
          <div className="mb-8 text-center border-b border-[var(--border-color)] pb-6">
            <Terminal className="mx-auto h-8 w-8 text-[var(--accent)] mb-4" />
            <h1 className="text-2xl font-bold tracking-tight uppercase">Admin Login</h1>
            <p className="mt-2 text-xs text-[var(--text-secondary)]">
              Please enter your credentials
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400 flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase text-[var(--text-secondary)]">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-[var(--text-secondary)]" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] px-3 py-2.5 pl-10 text-sm outline-none transition-colors focus-visible:border-[var(--accent)] focus-visible:ring-1 focus-visible:ring-[var(--accent)] rounded-none"
                    placeholder="email@address.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase text-[var(--text-secondary)]">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-[var(--text-secondary)]" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] px-3 py-2.5 pl-10 text-sm outline-none transition-colors focus-visible:border-[var(--accent)] focus-visible:ring-1 focus-visible:ring-[var(--accent)] rounded-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="mt-6 w-full flex items-center justify-center gap-2 border border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-fg)] px-4 py-2.5 text-sm font-bold uppercase transition-colors hover:bg-transparent hover:text-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed rounded-none"
            >
              {loginMutation.isPending ? (
                <>
                  <span className="inline-block h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
