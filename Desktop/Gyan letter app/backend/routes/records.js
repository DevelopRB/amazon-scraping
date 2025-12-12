import express from 'express'
import { pool } from '../db.js'

const router = express.Router()

// Get all records
router.get('/', async (req, res) => {
  try {
    const { search } = req.query
    let query = 'SELECT id, data, created_at, updated_at FROM records'
    const params = []

    if (search) {
      // Search in JSONB data using PostgreSQL's JSONB operators
      query += ` WHERE data::text ILIKE $1`
      params.push(`%${search}%`)
    }

    query += ' ORDER BY created_at DESC'

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching records:', error)
    res.status(500).json({ error: 'Failed to fetch records' })
  }
})

// Get a single record by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query(
      'SELECT id, data, created_at, updated_at FROM records WHERE id = $1',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching record:', error)
    res.status(500).json({ error: 'Failed to fetch record' })
  }
})

// Create a new record
router.post('/', async (req, res) => {
  try {
    const { data } = req.body

    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid data format' })
    }

    const result = await pool.query(
      'INSERT INTO records (data) VALUES ($1) RETURNING id, data, created_at, updated_at',
      [JSON.stringify(data)]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error creating record:', error)
    res.status(500).json({ error: 'Failed to create record' })
  }
})

// Bulk create records (for Excel import)
router.post('/bulk', async (req, res) => {
  const startTime = Date.now()
  const { records } = req.body

  console.log('\n=== BULK IMPORT STARTED ===')
  console.log(`📥 Received ${records?.length || 0} records to import`)
  console.log(`⏰ Start time: ${new Date().toISOString()}`)

  try {
    if (!Array.isArray(records) || records.length === 0) {
      console.error('❌ Invalid records format: records must be a non-empty array')
      return res.status(400).json({ error: 'Invalid records format: records must be a non-empty array' })
    }

    // Use a transaction for bulk insert
    const client = await pool.connect()
    try {
      console.log('🔄 Starting database transaction...')
      await client.query('BEGIN')

      const insertedRecords = []
      const skippedRecords = []
      const totalRecords = records.length
      const batchSize = Math.max(100, Math.floor(totalRecords / 10)) // Log every 10% or every 100 records

      console.log(`📊 Processing ${totalRecords} records in batches...`)
      console.log(`📦 Batch size for logging: ${batchSize} records`)

      for (let i = 0; i < records.length; i++) {
        const recordData = records[i]
        
        // Validate record data
        if (!recordData || typeof recordData !== 'object') {
          skippedRecords.push({ index: i, reason: 'Invalid record format' })
          console.warn(`⚠️  Skipping invalid record at index ${i}`)
          continue
        }

        try {
          const result = await client.query(
            'INSERT INTO records (data) VALUES ($1) RETURNING id, data, created_at, updated_at',
            [JSON.stringify(recordData)]
          )
          insertedRecords.push(result.rows[0])

          // Log progress at intervals
          if ((i + 1) % batchSize === 0 || i === records.length - 1) {
            const progress = ((i + 1) / totalRecords * 100).toFixed(1)
            console.log(`  ✓ Processed ${i + 1}/${totalRecords} records (${progress}%)`)
          }
        } catch (insertError) {
          skippedRecords.push({ index: i, reason: insertError.message })
          console.error(`  ✗ Failed to insert record at index ${i}: ${insertError.message}`)
        }
      }

      console.log('💾 Committing transaction...')
      await client.query('COMMIT')
      
      const endTime = Date.now()
      const duration = ((endTime - startTime) / 1000).toFixed(2)
      
      console.log('\n=== BULK IMPORT COMPLETED ===')
      console.log(`✅ Successfully imported: ${insertedRecords.length} records`)
      console.log(`⚠️  Skipped: ${skippedRecords.length} records`)
      console.log(`⏱️  Total time: ${duration} seconds`)
      console.log(`📈 Average: ${(insertedRecords.length / duration).toFixed(2)} records/second`)
      console.log(`⏰ End time: ${new Date().toISOString()}`)
      
      if (skippedRecords.length > 0) {
        console.log(`\n⚠️  Skipped records details:`)
        skippedRecords.slice(0, 10).forEach(skip => {
          console.log(`   - Index ${skip.index}: ${skip.reason}`)
        })
        if (skippedRecords.length > 10) {
          console.log(`   ... and ${skippedRecords.length - 10} more`)
        }
      }
      console.log('================================\n')

      res.status(201).json({ 
        message: `Successfully imported ${insertedRecords.length} records`,
        count: insertedRecords.length,
        skipped: skippedRecords.length,
        duration: `${duration}s`,
        recordsPerSecond: parseFloat((insertedRecords.length / duration).toFixed(2)),
        records: insertedRecords.slice(0, 10) // Return first 10 for preview
      })
    } catch (error) {
      await client.query('ROLLBACK')
      const endTime = Date.now()
      const duration = ((endTime - startTime) / 1000).toFixed(2)
      console.error('\n❌ BULK IMPORT FAILED')
      console.error(`⏱️  Failed after: ${duration} seconds`)
      console.error(`💥 Database error:`, error.message)
      console.error('================================\n')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)
    console.error('\n❌ BULK IMPORT ERROR')
    console.error(`⏱️  Error after: ${duration} seconds`)
    console.error(`💥 Error:`, error.message)
    console.error('================================\n')
    
    res.status(500).json({ 
      error: 'Failed to bulk create records',
      details: error.message,
      duration: `${duration}s`
    })
  }
})

// Update a record
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { data } = req.body

    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid data format' })
    }

    const result = await pool.query(
      'UPDATE records SET data = $1 WHERE id = $2 RETURNING id, data, created_at, updated_at',
      [JSON.stringify(data), id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating record:', error)
    res.status(500).json({ error: 'Failed to update record' })
  }
})

// Delete a record
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      'DELETE FROM records WHERE id = $1 RETURNING id',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' })
    }

    res.json({ message: 'Record deleted successfully', id: parseInt(id) })
  } catch (error) {
    console.error('Error deleting record:', error)
    res.status(500).json({ error: 'Failed to delete record' })
  }
})

// Delete all records
router.delete('/', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM records RETURNING id')
    res.json({ 
      message: 'All records deleted successfully',
      count: result.rows.length
    })
  } catch (error) {
    console.error('Error deleting all records:', error)
    res.status(500).json({ error: 'Failed to delete all records' })
  }
})

export default router

