// Authentication service for API calls
const getApiBaseUrl = () => {
  // If VITE_API_URL is set (for Render or custom deployments), use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  // For production builds, use relative URLs (works with Vercel)
  if (import.meta.env.PROD) {
    return ''
  }
  // For development, use localhost
  return 'http://localhost:5000'
}

const API_BASE_URL = getApiBaseUrl()

export const authService = {
  // Register a new user
  async register(username, password, email = '') {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, email }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to register')
    }

    return response.json()
  },

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
    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Invalid token')
    }

    return response.json()
  },
}

