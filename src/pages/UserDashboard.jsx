import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext.jsx'
import ImageUploader from '../components/upload/ImageUploader.jsx'
import RecipeCard from '../components/recipes/RecipeCard.jsx'
import { sampleRecipes } from '../utils/recipesData.js'
import { dietaryFilters, getApiUrl } from '../utils/constants.js'

export default function UserDashboard() {
  const { user } = useAuth()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('recipes')
  const [selectedFilters, setSelectedFilters] = useState([])
  const [analyzedIngredients, setAnalyzedIngredients] = useState(null)
  const [savedRecipes, setSavedRecipes] = useState([])
  const [history, setHistory] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredRecipes = sampleRecipes.filter(recipe => {
    const matchesFilters = selectedFilters.every(f => {
      if (f === 'vegan') return recipe.vegan
      if (f === 'vegetarian') return recipe.vegetarian
      if (f === 'low-carb') return recipe.lowCarb
      if (f === 'keto') return recipe.keto
      if (f === 'gluten-free') return recipe.glutenFree
      if (f === 'high-protein') return recipe.highProtein
      if (f === 'quick') return recipe.time <= 20
      if (f === 'no-cook') return recipe.noCook
      return true
    })
    const matchesSearch = !searchQuery || recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) || recipe.ingredients.some(i => i.includes(searchQuery.toLowerCase()))
    return matchesFilters && matchesSearch
  })

  const toggleFilter = (filter) => {
    setSelectedFilters(prev => prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter])
  }

  const handleImageAnalysis = async (ingredients) => {
    setIsAnalyzing(true)
    try {
      // In production, this calls the Gemini API via serverless function
      const response = await fetch(getApiUrl('/analyze'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ ingredients }),
      })
      const data = await response.json()
      setAnalyzedIngredients(data.ingredients || ingredients)
      setActiveTab('recipes')
    } catch {
      setAnalyzedIngredients(ingredients)
      setActiveTab('recipes')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const saveRecipe = (recipe) => {
    if (!savedRecipes.find(r => r.id === recipe.id)) {
      setSavedRecipes([...savedRecipes, recipe])
      setHistory(prev => [{ type: 'save', recipe: recipe.name, timestamp: new Date().toISOString() }, ...prev])
    }
  }

  const removeSavedRecipe = (id) => {
    setSavedRecipes(savedRecipes.filter(r => r.id !== id))
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 fixed inset-y-0 left-0 z-40">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🥗</span>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">PantryPlan</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'recipes', label: 'Recipes', icon: '🍳' },
            { id: 'scan', label: 'Scan Pantry', icon: '📸' },
            { id: 'saved', label: 'Saved', icon: '🔖' },
            { id: 'history', label: 'History', icon: '📜' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
              }`}
            >
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.username || 'User'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between lg:hidden">
            <span className="text-lg font-bold">🥗 PantryPlan</span>
            <span className="text-sm font-medium text-slate-500">{user?.username}</span>
          </div>
          <div className="hidden lg:block">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">{activeTab}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back, {user?.username}!</p>
          </div>
        </header>

        <div className="p-6 max-w-6xl mx-auto">
          {activeTab === 'dashboard' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Recipes Found', value: filteredRecipes.length.toString(), icon: '🍳', color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' },
                  { label: 'Pantry Items', value: analyzedIngredients ? analyzedIngredients.length.toString() : '0', icon: '🥬', color: 'text-teal-600 bg-teal-100 dark:bg-teal-900/30' },
                  { label: 'Saved Recipes', value: savedRecipes.length.toString(), icon: '🔖', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
                  { label: 'Actions Logged', value: history.length.toString(), icon: '📝', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
                ].map(stat => (
                  <div key={stat.label} className="card flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center text-xl`}>{stat.icon}</div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="card">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => setActiveTab('scan')} className="btn-primary">📸 Scan Pantry</button>
                  <button onClick={() => setActiveTab('recipes')} className="btn-secondary">🍳 Browse Recipes</button>
                  <button onClick={() => setActiveTab('saved')} className="btn-secondary">🔖 View Saved</button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'scan' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <ImageUploader onAnalyze={handleImageAnalysis} isAnalyzing={isAnalyzing} />
              {analyzedIngredients && !isAnalyzing && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Detected Ingredients</h3>
                  <div className="flex flex-wrap gap-2">
                    {analyzedIngredients.map((ing, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium animate-scale-in">
                        🔍 {ing}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {(activeTab === 'recipes' || activeTab === 'saved' || activeTab === 'history' || activeTab === 'dashboard') && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {(activeTab === 'recipes' || activeTab === 'dashboard') && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <input
                      type="text"
                      placeholder="Search recipes or ingredients..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="input-field !max-w-sm"
                    />
                    <div className="flex flex-wrap gap-2">
                      {dietaryFilters.map(filter => (
                        <button
                          key={filter.value}
                          onClick={() => toggleFilter(filter.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                            selectedFilters.includes(filter.value)
                              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {filter.icon} {filter.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {selectedFilters.length > 0 && (
                    <button onClick={() => setSelectedFilters([])} className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline">Clear all filters</button>
                  )}
                </div>
              )}

              {activeTab === 'saved' ? (
                savedRecipes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedRecipes.map(recipe => (
                      <RecipeCard key={recipe.id} recipe={recipe} saved={true} onRemove={() => removeSavedRecipe(recipe.id)} />
                    ))}
                  </div>
                ) : (
                  <div className="card text-center py-16">
                    <span className="text-4xl mb-4 block">🔖</span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Saved Recipes Yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">Browse recipes and save your favorites!</p>
                    <button onClick={() => setActiveTab('recipes')} className="btn-primary">Browse Recipes</button>
                  </div>
                )
              ) : activeTab === 'history' ? (
                history.length > 0 ? (
                  <div className="card">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {history.map((h, i) => (
                        <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                          <span className="text-lg">{h.type === 'save' ? '💾' : '🔍'}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{h.recipe || h.action_type}</p>
                            <p className="text-xs text-slate-500">{new Date(h.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="card text-center py-16">
                    <span className="text-4xl mb-4 block">📜</span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Activity Yet</h3>
                    <p className="text-slate-500 dark:text-slate-400">Your saved recipes and actions will appear here.</p>
                  </div>
                )
              ) : filteredRecipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRecipes.map((recipe, i) => (
                    <RecipeCard key={recipe.id} recipe={recipe} saved={savedRecipes.some(r => r.id === recipe.id)} onSave={() => saveRecipe(recipe)} />
                  ))}
                </div>
              ) : (
                <div className="card text-center py-16">
                  <span className="text-4xl mb-4 block">🔍</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Recipes Found</h3>
                  <p className="text-slate-500 dark:text-slate-400">Try adjusting your filters or search query.</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}
