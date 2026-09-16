import { motion } from 'framer-motion'

export default function LoadingSpinner({ size = 'md' }) {
  const sizeClasses = { sm: 'w-6 h-6 border-2', md: 'w-10 h-10 border-3', lg: 'w-14 h-14 border-4' }
  return (
    <div className="flex items-center justify-center py-8">
      <div className={`${sizeClasses[size]} border-emerald-600 border-t-transparent rounded-full animate-spin`} />
    </div>
  )
}
