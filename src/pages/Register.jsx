import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext.jsx'
import RegisterForm from '../components/auth/RegisterForm.jsx'

export default function Register() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    console.log('[Register] Auth state changed:', { loading, user: user?.username || null })
    if (!loading && user) {
      console.log('[Register] User already logged in, redirecting to /dashboard')
      navigate('/dashboard')
    } else if (!loading) {
      console.log('[Register] No active session, showing registration form')
    }
  }, [loading, user, navigate])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="flex items-center justify-center gap-2 mb-6">
            <span className="text-3xl">🥗</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">PantryPlan</span>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create Account</h1>
          <p className="text-slate-600 dark:text-slate-400">Join PantryPlan today</p>
        </div>
        <div className="card animate-fade-in">
          <RegisterForm />
          <p className="text-center text-slate-600 dark:text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </motion.div>
  )
}
