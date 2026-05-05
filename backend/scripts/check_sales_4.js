import { pool } from '../src/db.js'
import dotenv from 'dotenv'
dotenv.config()

async function checkSalesFour() {
  try {
    const res = await pool.query('SELECT count(*) FROM ventas WHERE negocio_id = 4')
    console.log(`Sales with negocio_id 4: ${res.rows[0].count}`)
  } catch (err) {
    console.error('Error:', err)
  } finally {
    await pool.end()
  }
}

checkSalesFour()
