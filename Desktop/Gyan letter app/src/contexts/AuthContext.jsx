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
      if (storedToken && storedToken.trim() !== '') {
        try {
          const response = await authService.verifyToken(storedToken)
          if (response && response.user && response.valid !== false) {
            setUser(response.user)
            setToken(storedToken)
          } else {
            // Invalid response, clear token
            console.warn('Invalid auth response, clearing token')
            localStorage.removeItem('authToken')
            setToken(null)
            setUser(null)
          }
        } catch (error) {
          // Token is invalid or API error, clear it
          console.error('Auth verification failed:', error.message || error)
          localStorage.removeItem('authToken')
          setToken(null)
          setUser(null)
        }
      } else {
        // No token, ensure user is null
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

  const register = async (username, password, email = '') => {
    try {
      const response = await authService.register(username, password, email)
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
    register,
    logout,
    isAuthenticated: !!user,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

