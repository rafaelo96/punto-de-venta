import { pool } from '../src/db.js'
import dotenv from 'dotenv'
dotenv.config()

async function nuclearSync() {
  try {
    console.log('--- NUCLEAR SYNC STARTING ---')
    
    // 1. Ensure Negocio 4 exists
    await pool.query(`
      INSERT INTO negocios (id, nombre, slug, color_principal) 
      VALUES (4, 'Negocio Final 4', 'negocio_4', '#3b82f6')
      ON CONFLICT (id) DO NOTHING
    `)

    // 2. Find the user test@pos.com
    const userRes = await pool.query('SELECT id FROM usuarios WHERE email = $1', ['test@pos.com'])
    if (userRes.rows.length === 0) {
      console.error('User test@pos.com not found')
      return
    }
    const userId = userRes.rows[0].id
    console.log(`Target User ID from DB: ${userId}`)

    // 3. Update ALL sales to Negocio 4 and the actual DB User ID
    const salesUpd = await pool.query(
      "UPDATE ventas SET negocio_id = 4, usuario_id = $1",
      [userId]
    )
    console.log(`Updated ${salesUpd.rowCount} sales to Negocio 4 and User ${userId}`)

    // 4. Update the user to Negocio 4
    await pool.query("UPDATE usuarios SET negocio_id = 4 WHERE email = $1", ['test@pos.com'])
    
    console.log('\nSUCCESS: Database is now perfectly aligned with Negocio 4 and the actual User ID.')
  } catch (err) {
    console.error('Error:', err)
  } finally {
    await pool.end()
  }
}

nuclearSync()
