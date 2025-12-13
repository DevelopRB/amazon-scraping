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
export default function handler(req, res) {
  // Store original URL and path
  const originalUrl = req.url
  const originalPath = req.path || ''
  
  // Extract the path after /api/records
  // For /api/records, path will be empty, use '/'
  // For /api/records/123, path will be '/123'
  // For /api/records/bulk, path will be '/bulk'
  let newPath = originalPath.replace(/^\/api\/records/, '') || '/'
  if (!newPath.startsWith('/')) {
    newPath = '/' + newPath
  }
  
  // Update req.url and req.path for Express routing
  const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''
  req.url = newPath + queryString
  req.path = newPath
  req.originalUrl = newPath + queryString
  
  // Handle the request with Express app
  app(req, res)
}
