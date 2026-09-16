import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { dietaryFilters } from '../../utils/constants.js'
import { createDemoToken } from '../../utils/token.js'

export default function RegisterForm() {
  const { login } = useAuth()
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '', dietary: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    console.log('[Register] Form submitted:', { username: form.username, email: form.email, dietary: form.dietary })

    if (form.password !== form.confirmPassword) {
      console.log('[Register] Validation failed: passwords do not match')
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      console.log('[Register] Validation failed: password too short')
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      console.log('[Register] Sending API request to /api/auth/register')
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, email: form.email, password: form.password, dietary_preferences: form.dietary }),
      })
      const data = await res.json()
      console.log('[Register] API response:', res.status, data)

      if (res.ok) {
        console.log('[Register] 200 OK - Registration successful via API')
        login(data.user, data.token)
      } else if (res.status === 400) {
        console.log('[Register] 400 Bad Request -', data.message)
        setError(data.message || 'Registration failed')
      } else if (res.status >= 500) {
        console.log('[Register] 500 Server Error -', data.message)
        setError('Server error. Please try again later.')
      } else {
        console.log('[Register] Unexpected status:', res.status)
        setError(data.message || 'Registration failed')
      }
    } catch (err) {
      console.log('[Register] API request failed (fallback demo mode):', err.message)
      const user = { id: Date.now(), username: form.username, email: form.email, role: 'user' }
      console.log('[Register] Creating demo user:', user)
      login(user, createDemoToken(user))
      setError('')
    } finally {
      setLoading(false)
      console.log('[Register] Loading state set to false')
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
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username</label>
        <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required className="input-field" placeholder="ChefJohn" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="input-field" placeholder="you@example.com" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
        <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required className="input-field" placeholder="••••••••" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
        <input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required className="input-field" placeholder="••••••••" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Dietary Preferences (optional)</label>
        <div className="flex flex-wrap gap-2">
          {dietaryFilters.map(filter => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setForm({ ...form, dietary: form.dietary === filter.value ? '' : filter.value })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                form.dietary === filter.value ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {filter.icon} {filter.label}
            </button>
          ))}
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>
      <p className="text-xs text-slate-500 dark:text-slate-400 text-center">No OTP required — instant registration</p>
    </form>
  )
}
