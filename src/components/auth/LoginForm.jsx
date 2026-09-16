import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { createDemoToken } from '../../utils/token.js'

export default function LoginForm() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    console.log('[Login] Form submitted:', { email })

    try {
      console.log('[Login] Sending API request to /api/auth/login')
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      console.log('[Login] API response:', res.status, data)

      if (res.ok) {
        console.log('[Login] 200 OK - Sign in successful via API')
        login(data.user, data.token)
      } else if (res.status === 400) {
        console.log('[Login] 400 Bad Request -', data.message)
        setError(data.message || 'Login failed')
      } else if (res.status >= 500) {
        console.log('[Login] 500 Server Error -', data.message)
        setError('Server error. Please try again later.')
      } else {
        console.log('[Login] Unexpected status:', res.status)
        setError(data.message || 'Login failed')
      }
    } catch (err) {
      console.log('[Login] API request failed (fallback demo mode):', err.message)
      const user = { id: 1, username: email.split('@')[0], email, role: 'user' }
      console.log('[Login] Creating demo user:', user)
      login(user, createDemoToken(user))
      setError('')
    } finally {
      setLoading(false)
      console.log('[Login] Loading state set to false')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up">
      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
          {error}
        </motion.div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-field" placeholder="you@example.com" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="input-field" placeholder="••••••••" />
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
      <p className="text-xs text-slate-500 dark:text-slate-400 text-center">Demo: any email/password will work</p>
    </form>
  )
}
