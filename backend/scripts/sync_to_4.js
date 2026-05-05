import { pool } from '../src/db.js'
import dotenv from 'dotenv'
dotenv.config()

async function syncToNegocioFour() {
  try {
    console.log('--- SYNCING ALL DATA TO NEGOCIO ID 4 ---')
    
    // 1. Update user test@pos.com to negocio_id 4
    const userUpd = await pool.query(
      "UPDATE usuarios SET negocio_id = 4 WHERE email = $1",
      ['test@pos.com']
    )
    console.log(`Updated user test@pos.com to negocio_id 4. Rows affected: ${userUpd.rowCount}`)

    // 2. Update ALL sales to negocio_id 4
    const salesUpd = await pool.query(
      "UPDATE ventas SET negocio_id = 4"
    )
    console.log(`Updated ${salesUpd.rowCount} sales to negocio_id 4`)

    console.log('\nSUCCESS: All data moved to Negocio ID 4.')
    console.log('Please refresh your page or log in again.')
  } catch (err) {
    console.error('Error:', err)
  } finally {
    await pool.end()
  }
}

syncToNegocioFour()
