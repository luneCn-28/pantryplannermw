import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'

export default function Home() {
  const { user } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">🥗</span>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">PantryPlan</span>
            </Link>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              {user ? (
                <Link to="/dashboard" className="btn-primary">Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors">Sign In</Link>
                  <Link to="/register" className="btn-primary">Get Started</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-50 dark:from-emerald-950/20 dark:via-teal-950/20 dark:via-slate-950 dark:to-slate-950" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-6">
                <span>✨</span> Powered by Vision AI
              </span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 leading-tight">
              See Your Pantry,{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Discover Recipes</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
              Snap a photo of your fridge or pantry. Our AI identifies ingredients and instantly suggests personalized recipes that match your dietary preferences and time constraints.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <Link to="/dashboard" className="btn-primary text-lg px-8 py-4 w-full sm:w-auto">Go to Dashboard 🚀</Link>
              ) : (
                <>
                  <Link to="/dashboard" className="btn-primary text-lg px-8 py-4 w-full sm:w-auto">Start Planning 🚀</Link>
                  <Link to="/register" className="btn-outline text-lg px-8 py-3.5 w-full sm:w-auto">Create Free Account</Link>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', icon: '📸', title: 'Snap Your Pantry', desc: 'Take a clear photo of your fridge, pantry, or kitchen counter.', color: 'bg-emerald-100 dark:bg-emerald-900/30' },
              { step: '2', icon: '🤖', title: 'AI Detection', desc: 'Our Vision AI instantly identifies all visible ingredients with precision.', color: 'bg-teal-100 dark:bg-teal-900/30' },
              { step: '3', icon: '🍳', title: 'Get Recipes', desc: 'Receive personalized recipes based on your ingredients and diet.', color: 'bg-blue-100 dark:bg-blue-900/30' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card text-center hover:shadow-lg transition-shadow"
              >
                <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center text-3xl mx-auto mb-4`}>{item.icon}</div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-widest uppercase">Step {item.step}</span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-2 mb-3">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-emerald-50 dark:bg-emerald-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card !bg-white dark:!bg-slate-800/50 text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Ready to Reduce Food Waste?</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">Stop guessing what to cook. Let AI turn your existing ingredients into delicious meals tailored to your lifestyle.</p>
            <Link to={user ? '/dashboard' : '/register'} className="btn-primary text-lg px-8 py-4">{user ? 'Go to Dashboard' : 'Create Your Free Account'}</Link>
          </div>
        </div>
      </section>
    </motion.div>
  )
}
