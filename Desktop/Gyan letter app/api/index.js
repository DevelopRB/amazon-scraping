// Main API handler for Vercel - catches all /api/* routes
import express from 'express'
import cors from 'cors'
import { pool, initDatabase } from '../backend/db.js'
import recordsRoutes from '../backend/routes/records.js'

// Initialize database connection
initDatabase().catch(console.error)

const app = express()

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()')
    res.json({ 
      status: 'ok', 
      database: 'connected',
      timestamp: result.rows[0].now
    })
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected',
      error: error.message 
    })
  }
})

// Records routes
app.use('/api/records', recordsRoutes)

// Export as Vercel serverless function handler
export default async function handler(req, res) {
  return new Promise((resolve) => {
    app(req, res, () => {
      resolve()
    })
  })
}

