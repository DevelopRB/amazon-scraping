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
      
      // Clear token if it exists but is empty or invalid format
      if (storedToken && storedToken.trim() === '') {
        console.log('[AuthContext] Empty token found, clearing it')
        localStorage.removeItem('authToken')
        setUser(null)
        setToken(null)
        setLoading(false)
        return
      }
      
      // If no token, user is definitely not authenticated
      if (!storedToken || storedToken.trim() === '') {
        console.log('[AuthContext] No token found, user not authenticated')
        setUser(null)
        setToken(null)
        setLoading(false)
        return
      }
      
      // Token exists, verify it
      try {
        console.log('[AuthContext] Verifying token...')
        const response = await authService.verifyToken(storedToken)
        
        // Strict validation: must have valid response with correct username
        if (response && 
            response.user && 
            response.valid !== false && 
            response.user.username === 'admin') {
          console.log('[AuthContext] Authentication successful, user:', response.user.username)
          setUser(response.user)
          setToken(storedToken)
        } else {
          // Invalid response, clear token immediately
          console.warn('[AuthContext] Invalid auth response, clearing token. Response:', response)
          localStorage.removeItem('authToken')
          setToken(null)
          setUser(null)
        }
      } catch (error) {
        // Token is invalid or API error, clear it immediately
        console.error('[AuthContext] Auth verification failed:', error.message || error)
        console.error('[AuthContext] Clearing invalid token - will redirect to login')
        localStorage.removeItem('authToken')
        setToken(null)
        setUser(null)
      } finally {
        // Always set loading to false after check completes
        setLoading(false)
      }
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

