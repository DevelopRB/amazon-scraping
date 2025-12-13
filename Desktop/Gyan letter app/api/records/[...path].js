// Vercel serverless function for /api/records routes
import express from 'express'
import cors from 'cors'
import { pool, initDatabase } from '../../backend/db.js'
import recordsRoutes from '../../backend/routes/records.js'

// Initialize database connection
initDatabase().catch(console.error)

const app = express()

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Mount records routes
app.use('/', recordsRoutes)

// Export as Vercel serverless function handler
// Vercel will call this handler for all /api/records/* routes
export default async function handler(req, res) {
  // Store original URL
  const originalUrl = req.url
  
  // Remove /api/records prefix from the URL since the router handles relative paths
  // Handle both /api/records and /api/records/ paths
  req.url = req.url.replace(/^\/api\/records\/?/, '') || '/'
  
  // Ensure req.url starts with / for Express routing
  if (!req.url.startsWith('/')) {
    req.url = '/' + req.url
  }
  
  // Handle the request with Express app
  return new Promise((resolve) => {
    app(req, res, () => {
      resolve()
    })
  })
}


