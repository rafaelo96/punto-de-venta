import { pool } from '../src/db.js'
import dotenv from 'dotenv'
dotenv.config()

async function fixEverything() {
  try {
    console.log('--- FIXING AUTH AND SALES CONSISTENCY ---')
    
    // 1. Identify the correct business ID
    // We'll use the one that has the most sales (usually the main one)
    const negRes = await pool.query('SELECT id FROM negocios LIMIT 1')
    const correctNegocioId = negRes.rows[0].id
    console.log(`Setting all to Negocio ID: ${correctNegocioId}`)

    // 2. Update user test@pos.com to this negocio_id
    const userUpd = await pool.query(
      "UPDATE usuarios SET negocio_id = $1 WHERE email = $2",
      [correctNegocioId, 'test@pos.com']
    )
    console.log(`Updated user to negocio_id ${correctNegocioId}`)

    // 3. Update all sales to this negocio_id
    const salesUpd = await pool.query(
      "UPDATE ventas SET negocio_id = $1",
      [correctNegocioId]
    )
    console.log(`Updated ${salesUpd.rowCount} sales to negocio_id ${correctNegocioId}`)

    console.log('\nSUCCESS: All data aligned. Please LOG OUT and LOG IN again to refresh your token.')
  } catch (err) {
    console.error('Error fixing consistency:', err)
  } finally {
    await pool.end()
  }
}

fixEverything()
