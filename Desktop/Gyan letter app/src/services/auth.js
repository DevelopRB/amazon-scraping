// Authentication service for API calls
const getApiBaseUrl = () => {
  // If VITE_API_URL is set (for Render or custom deployments), use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  // For production builds, use relative URLs (works with Vercel)
  if (import.meta.env.PROD) {
    // In production, if VITE_API_URL is not set, try to use the same origin
    // This works if frontend and backend are on the same domain
    return ''
  }
  // For development, use localhost
  return 'http://localhost:5000'
}

const API_BASE_URL = getApiBaseUrl()

// Debug logging (always log in production to help debug)
console.log('[Auth Service] API Base URL:', API_BASE_URL || 'same origin')
console.log('[Auth Service] VITE_API_URL env:', import.meta.env.VITE_API_URL || 'not set')
console.log('[Auth Service] PROD mode:', import.meta.env.PROD)

export const authService = {
  // Login
  async login(username, password) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to login')
    }

    return response.json()
  },

  // Verify token
  async verifyToken(token) {
    if (!token) {
      throw new Error('No token provided')
    }

    const verifyUrl = `${API_BASE_URL}/api/auth/verify`
    console.log('[Auth Service] Verifying token at:', verifyUrl)

    try {
      const response = await fetch(verifyUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      console.log('[Auth Service] Verify response status:', response.status)

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = 'Invalid token'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
          console.error('[Auth Service] Verify error:', errorMessage)
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || 'Authentication failed'
          console.error('[Auth Service] Verify error (non-JSON):', errorMessage)
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('[Auth Service] Verify success:', data)
      
      // Validate response structure
      if (!data || !data.user) {
        console.error('[Auth Service] Invalid response structure:', data)
        throw new Error('Invalid response from server')
      }

      return data
    } catch (error) {
      // Log network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('[Auth Service] Network error:', error.message)
        console.error('[Auth Service] This might be a CORS issue or the backend is not accessible')
        throw new Error('Cannot reach authentication server. Please check your connection.')
      }
      // Re-throw other errors
      if (error.message) {
        throw error
      }
      throw new Error('Failed to verify token')
    }
  },
}

