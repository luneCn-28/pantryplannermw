import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { useAuth } from './AuthContext.jsx'

const DebugContext = createContext()

export function DebugProvider({ children }) {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const countRef = useRef(0)

  const log = useCallback((source, message) => {
    const entry = { id: ++countRef.current, source, message, time: new Date().toLocaleTimeString() }
    setLogs(prev => [...prev.slice(-100), entry])
    // eslint-disable-next-line no-console
    console.log(`[${source}] ${message}`)
  }, [])

  const clear = useCallback(() => setLogs([]), [])

  useEffect(() => {
    window.__debugLog = log
    window.__debugClear = clear

    const originalConsole = console.log.bind(console)
    console.log = (...args) => {
      const message = args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ')
      const match = message.match(/^\[([^\]]+)\]\s*(.*)/)
      if (match) {
        const entry = { id: ++countRef.current, source: match[1], message: match[2], time: new Date().toLocaleTimeString() }
        setLogs(prev => [...prev.slice(-100), entry])
      }
      originalConsole(...args)
    }

    return () => {
      delete window.__debugLog
      delete window.__debugClear
      console.log = originalConsole
    }
  }, [log, clear])

  return (
    <DebugContext.Provider value={{ logs, log, clear }}>
      {children}
    </DebugContext.Provider>
  )
}

export const useDebug = () => useContext(DebugContext)
