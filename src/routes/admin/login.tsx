import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { login, getCurrentUser } from '@/server/functions/auth.functions'

import { Link } from '@tanstack/react-router'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import '@/components/admin/admin.css'
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
    onSuccess: () => navigate({ to: '/admin' }),
    onError: () => setError('Sign in failed. Check your email and password, then try again.'),
  })
  return <main id="main-content" className="admin-login">
    <div className="admin-login__intro"><Link to="/">adryanev.com</Link><h1>Content studio</h1><p>Your work, writing, and everything behind the website.</p><ThemeToggle /></div>
    <form className="admin-login__form" onSubmit={(event) => { event.preventDefault(); if (!loginMutation.isPending) { setError(''); loginMutation.mutate() } }}>
      <h2>Sign in</h2><p>Use your admin account to continue.</p>
      {error && <div className="admin-feedback" role="alert"><AlertTriangle size={18} />{error}</div>}
      <label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
      <label htmlFor="password">Password</label><input id="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
      <button type="submit" disabled={loginMutation.isPending}>{loginMutation.isPending ? 'Signing in…' : 'Sign in'}</button>
      <Link to="/">Back to website</Link>
    </form>
  </main>
}
