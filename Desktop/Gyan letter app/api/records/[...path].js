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
  // Remove /api/records prefix from the URL since the router handles relative paths
  const originalUrl = req.url
  req.url = req.url.replace(/^\/api\/records/, '') || '/'
  
  // Handle the request with Express app
  app(req, res)
}


