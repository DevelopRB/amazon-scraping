import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/auth'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('authToken'))
  const [loading, setLoading] = useState(true)

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('authToken')
      console.log('[AuthContext] Checking authentication, token exists:', !!storedToken)
      
      if (storedToken && storedToken.trim() !== '') {
        try {
          console.log('[AuthContext] Verifying token...')
          const response = await authService.verifyToken(storedToken)
          if (response && response.user && response.valid !== false) {
            console.log('[AuthContext] Authentication successful, user:', response.user.username)
            setUser(response.user)
            setToken(storedToken)
          } else {
            // Invalid response, clear token
            console.warn('[AuthContext] Invalid auth response, clearing token')
            localStorage.removeItem('authToken')
            setToken(null)
            setUser(null)
          }
        } catch (error) {
          // Token is invalid or API error, clear it
          console.error('[AuthContext] Auth verification failed:', error.message || error)
          console.error('[AuthContext] Clearing token and redirecting to login')
          localStorage.removeItem('authToken')
          setToken(null)
          setUser(null)
        }
      } else {
        // No token, ensure user is null
        console.log('[AuthContext] No token found, user not authenticated')
        setUser(null)
        setToken(null)
      }
      // Always set loading to false after check completes
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password)
      localStorage.setItem('authToken', response.token)
      setToken(response.token)
      setUser(response.user)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    setToken(null)
    setUser(null)
  }

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

