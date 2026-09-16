import { useState } from 'react'
import { useDebug } from '../../contexts/DebugContext.jsx'

export default function DebugPanel() {
  const { logs, clear } = useDebug()
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 w-10 h-10 rounded-full bg-slate-800 text-white text-xs font-bold shadow-lg hover:bg-slate-700 transition-colors"
        title="Debug Console"
      >
        🐛
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-80 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 flex flex-col animate-scale-in">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700">
        <span className="text-xs font-bold">🐛 Debug Console ({logs.length})</span>
        <div className="flex gap-2">
          <button onClick={clear} className="text-xs text-slate-400 hover:text-white">Clear</button>
          <button onClick={() => setIsOpen(false)} className="text-xs text-slate-400 hover:text-white">✕</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5 font-mono text-xs">
        {logs.length === 0 && <div className="text-slate-500 italic">No logs yet. Sign in to see auth flow.</div>}
        {logs.map(l => (
          <div key={l.id} className="text-slate-300">
            <span className="text-emerald-400">[{l.source}]</span>{' '}
            <span className="text-slate-500">{l.time}</span>{' '}
            {l.message}
          </div>
        ))}
      </div>
    </div>
  )
}
