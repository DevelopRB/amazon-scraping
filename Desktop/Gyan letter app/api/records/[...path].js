// Vercel serverless function for /api/records routes
import express from 'express'
import cors from 'cors'
import { pool, initDatabase } from '../../backend/db.js'
import recordsRoutes from '../../backend/routes/records.js'

const app = express()

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Initialize database connection
initDatabase().catch(console.error)

// Mount records routes
app.use('/', recordsRoutes)

export default app

