export const JWT_SECRET = 'smart-pantry-jwt-secret-key-change-in-production'

export const getApiUrl = (path) => {
  if (typeof window !== 'undefined') {
    return `/api${path}`
  }
  return path
}

export const dietaryFilters = [
  { value: 'vegan', label: 'Vegan', icon: '🌱', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  { value: 'vegetarian', label: 'Vegetarian', icon: '🥬', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { value: 'low-carb', label: 'Low Carb', icon: '🥩', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  { value: 'keto', label: 'Keto', icon: '🥑', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
  { value: 'gluten-free', label: 'Gluten Free', icon: '🌾', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  { value: 'high-protein', label: 'High Protein', icon: '💪', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  { value: 'quick', label: 'Under 20 min', icon: '⚡', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { value: 'no-cook', label: 'No Cook', icon: '🍽️', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
]

export const timeCategories = [
  { value: 'all', label: 'Any time' },
  { value: 'quick', label: 'Under 20 min' },
  { value: 'medium', label: '20-45 min' },
  { value: 'slow', label: '45+ min' },
]
