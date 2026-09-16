import { createContext, useContext, useState, useEffect } from 'react'
import { decodeTokenAny } from '../utils/token.js'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('[Auth] Token changed:', token ? `${token.substring(0, 30)}... (${token.split('.').length} parts)` : 'null')
    if (token) {
      const decoded = decodeTokenAny(token)
      console.log('[Auth] Decoded token:', decoded)
      if (decoded && decoded.exp * 1000 > Date.now()) {
        console.log('[Auth] Token valid, setting user:', decoded.username)
        setUser(decoded)
      } else {
        console.log('[Auth] Token expired or invalid, clearing session')
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
      }
    } else {
      console.log('[Auth] No token, session cleared')
    }
    setLoading(false)
    console.log('[Auth] Loading state set to false, user:', user ? user.username : 'null')
  }, [token])

  const login = (userData, jwtToken) => {
    console.log('[Auth] Login called for:', userData.username, '| token:', jwtToken ? `${jwtToken.substring(0, 30)}...` : 'null')
    setUser(userData)
    setToken(jwtToken)
    localStorage.setItem('token', jwtToken)
    console.log('[Auth] Login complete, user set:', userData.username)
  }

  const logout = () => {
    console.log('[Auth] Logout called for:', user?.username)
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    console.log('[Auth] Logout complete')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
