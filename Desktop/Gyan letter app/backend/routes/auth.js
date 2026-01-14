import express from 'express'
import jwt from 'jsonwebtoken'

const router = express.Router()

// JWT secret key (should be in environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Hardcoded credentials - can be shared with team
// These can be changed via environment variables if needed
const HARDCODED_USERNAME = process.env.APP_USERNAME || 'admin'
const HARDCODED_PASSWORD = process.env.APP_PASSWORD || 'admin123'

// Login with hardcoded credentials
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }

    // Check against hardcoded credentials
    if (username !== HARDCODED_USERNAME || password !== HARDCODED_PASSWORD) {
      return res.status(401).json({ error: 'Invalid username or password' })
    }

    // Generate JWT token
    const token = jwt.sign(
      { username: HARDCODED_USERNAME },
      JWT_SECRET,
      { expiresIn: '30d' } // 30 days expiration
    )

    res.json({
      message: 'Login successful',
      token,
      user: {
        username: HARDCODED_USERNAME
      }
    })
  } catch (error) {
    console.error('Error logging in:', error)
    res.status(500).json({ error: 'Failed to login' })
  }
})

// Verify token (for checking if user is authenticated)
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const decoded = jwt.verify(token, JWT_SECRET)

    // Verify the token contains the correct username
    // Old tokens from database-based auth might have userId instead of username
    // Reject any token that doesn't have the correct username
    if (!decoded.username || decoded.username !== HARDCODED_USERNAME) {
      console.log('[Auth] Token verification failed: username mismatch or missing username')
      return res.status(401).json({ error: 'Invalid token - authentication system changed' })
    }

    res.json({
      valid: true,
      user: {
        username: HARDCODED_USERNAME
      }
    })
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }
    console.error('Error verifying token:', error)
    res.status(500).json({ error: 'Failed to verify token' })
  }
})

export default router


