import { pool } from '../src/db.js'
import dotenv from 'dotenv'
dotenv.config()

async function auditProducts() {
  try {
    console.log('--- PRODUCT AUDIT ---')
    const res = await pool.query('SELECT negocio_id, count(*) FROM productos GROUP BY negocio_id')
    console.log('Products per Negocio ID:')
    res.rows.forEach(r => console.log(`- Negocio ${r.negocio_id}: ${r.count} products`))
    
    const sample = await pool.query('SELECT * FROM productos LIMIT 5')
    console.log('\nSample products:')
    console.table(sample.rows)
  } catch (err) {
    console.error('Error:', err)
  } finally {
    await pool.end()
  }
}

auditProducts()
