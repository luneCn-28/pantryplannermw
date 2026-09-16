import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()

  const handleClearSession = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('users')
    localStorage.removeItem('actions')
    logout()
    navigate('/')
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <div className="card text-center max-w-md animate-fade-in">
          <span className="text-5xl mb-4 block">🔒</span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Authentication Required</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">You need to sign in to access this page.</p>
          {/* eslint-disable-next-line no-restricted-globals */}
          <button
            onClick={handleClearSession}
            className="btn-secondary mb-4"
          >
            🧹 Clear Session & Reload
          </button>
          <div className="flex flex-col gap-3">
            <Link to="/login" className="btn-primary inline-block">Sign In</Link>
            <Link to="/register" className="btn-outline inline-block">Create Free Account</Link>
          </div>
          <p className="mt-4 text-xs text-slate-400">Demo: use any email & password</p>
        </div>
      </motion.div>
    )
  }

  return children
}
