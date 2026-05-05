import { pool } from '../src/db.js'
import dotenv from 'dotenv'
dotenv.config()

async function forceNegocioFour() {
  try {
    console.log('--- FORCING NEGOCIO ID 4 ---')
    
    // 1. Insert Negocio 4 if it doesn't exist
    await pool.query(`
      INSERT INTO negocios (id, nombre, slug, color_principal) 
      VALUES (4, 'Negocio Forzado 4', 'negocio_4', '#3b82f6')
      ON CONFLICT (id) DO NOTHING
    `)
    console.log('Ensured Negocio ID 4 exists.')

    // 2. Move all sales to Negocio 4
    const salesUpd = await pool.query('UPDATE ventas SET negocio_id = 4')
    console.log(`Moved ${salesUpd.rowCount} sales to Negocio ID 4`)

    // 3. Move user test@pos.com to Negocio 4
    const userUpd = await pool.query(
      "UPDATE usuarios SET negocio_id = 4 WHERE email = $1",
      ['test@pos.com']
    )
    console.log(`Updated user test@pos.com to Negocio ID 4. Rows: ${userUpd.rowCount}`)

    console.log('\nSUCCESS: All data aligned to ID 4.')
  } catch (err) {
    console.error('Error:', err)
  } finally {
    await pool.end()
  }
}

forceNegocioFour()
