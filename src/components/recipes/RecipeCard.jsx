import { motion } from 'framer-motion'
import { Heart, Bookmark, Trash2 } from 'lucide-react'

export default function RecipeCard({ recipe, saved = false, onSave, onRemove }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4, boxShadow: '0 20px 40px -12px rgba(0,0,0,0.15)' }}
      transition={{ duration: 0.2 }}
      className="card p-0 overflow-hidden group cursor-default"
    >
      <div className="h-40 bg-gradient-to-br from-emerald-100 via-teal-100 to-slate-100 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-slate-800 flex items-center justify-center relative">
        <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
          {recipe.category === 'breakfast' ? '🍳' : recipe.category === 'lunch' ? '🥗' : '🍽️'}
        </span>
        <div className="absolute top-3 right-3">
          {saved ? (
            <button onClick={onRemove} className="p-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/40 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={onSave} className="p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 text-slate-400 hover:text-emerald-500 hover:bg-white transition-all">
              <Bookmark className="w-4 h-4" />
            </button>
          )}
        </div>
        <span className={`absolute bottom-3 left-3 px-2 py-0.5 rounded-lg text-xs font-medium ${
          recipe.time <= 20 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
        }`}>
          ⏱️ {recipe.time} min
        </span>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{recipe.name}</h3>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {recipe.vegan && <span className="badge bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">🌱 Vegan</span>}
          {recipe.vegetarian && <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">🥬 Veg</span>}
          {recipe.lowCarb && <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">🥩 Low Carb</span>}
          {recipe.keto && <span className="badge bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">🥑 Keto</span>}
          {recipe.glutenFree && <span className="badge bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">🌾 GF</span>}
          {recipe.highProtein && <span className="badge bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">💪 High Protein</span>}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{recipe.instructions}</p>
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-700">
          <span>🔥 {recipe.calories} cal</span>
          <span>💪 {recipe.protein}g protein</span>
          <span className="ml-auto capitalize">{recipe.difficulty}</span>
        </div>
      </div>
    </motion.div>
  )
}
