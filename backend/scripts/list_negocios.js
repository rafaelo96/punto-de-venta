import { pool } from '../src/db.js'
import dotenv from 'dotenv'
dotenv.config()

async function listAllNegocioIds() {
  try {
    const res = await pool.query('SELECT DISTINCT negocio_id FROM ventas')
    console.log('Negocio IDs present in ventas table:')
    res.rows.forEach(r => console.log(`- ${r.negocio_id}`))
  } catch (err) {
    console.error('Error:', err)
  } finally {
    await pool.end()
  }
}

listAllNegocioIds()
