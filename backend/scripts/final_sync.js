import { pool } from '../src/db.js'
import dotenv from 'dotenv'
dotenv.config()

async function finalSync() {
  try {
    console.log('--- FINAL FORCE SYNC ---')
    
    // Ensure Negocio 4 exists
    await pool.query(`
      INSERT INTO negocios (id, nombre, slug, color_principal) 
      VALUES (4, 'Correct Negocio', 'correct_negocio', '#3b82f6')
      ON CONFLICT (id) DO NOTHING
    `)

    // Force all sales to Negocio 4 and Usuario 2 (test@pos.com)
    const res = await pool.query(
      "UPDATE ventas SET negocio_id = 4, usuario_id = 2"
    )
    console.log(`Updated ${res.rowCount} sales to Negocio 4 and Usuario 2`)

    console.log('Done. Try refreshing the history page.')
  } catch (err) {
    console.error('Error:', err)
  } finally {
    await pool.end()
  }
}

finalSync()
