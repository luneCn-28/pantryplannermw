import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Upload, Loader2 } from 'lucide-react'

export default function ImageUploader({ onAnalyze, isAnalyzing }) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState(null)
  const [detectedItems, setDetectedItems] = useState([])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) processFile(files[0])
  }, [])

  const processFile = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target.result)
      // Simulate ingredient detection
      const mockIngredients = ['tomato', 'onion', 'garlic', 'chicken', 'broccoli', 'lemon', 'olive oil']
      setDetectedItems(mockIngredients)
      setTimeout(() => onAnalyze(mockIngredients), 1500)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
            : 'border-slate-300 dark:border-slate-600 hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/10'
        }`}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input id="file-input" type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files.length > 0 && processFile(e.target.files[0])} />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4"
        >
          {isAnalyzing ? <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" /> : <Upload className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />}
        </motion.div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          {isAnalyzing ? 'Analyzing Image...' : isDragging ? 'Drop here' : 'Drag & drop your pantry photo'}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-4">or click to browse files</p>
        <span className="text-xs text-slate-400">Supports JPG, PNG, WebP (max 10MB)</span>
      </div>

      {preview && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card">
          <img src={preview} alt="Pantry preview" className="w-full h-64 object-cover rounded-xl mb-4" />
          {detectedItems.length > 0 && (
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Detected Ingredients:</p>
              <div className="flex flex-wrap gap-2">
                {detectedItems.map(ing => (
                  <span key={ing} className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm capitalize">{ing}</span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
