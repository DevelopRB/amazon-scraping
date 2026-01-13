import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Loader2 } from 'lucide-react'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth()

  // Show loading state while checking authentication
  if (loading) {
    console.log('[ProtectedRoute] Loading authentication state...')
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Strictly check authentication - if no user, redirect to login
  if (!isAuthenticated || !user) {
    console.log('[ProtectedRoute] Not authenticated, redirecting to login. isAuthenticated:', isAuthenticated, 'user:', user)
    return <Navigate to="/login" replace />
  }

  console.log('[ProtectedRoute] Authenticated, rendering protected content for user:', user.username)
  return children
}

