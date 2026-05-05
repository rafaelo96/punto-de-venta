import { pool } from '../src/db.js'
import dotenv from 'dotenv'
dotenv.config()

async function syncProductsToFour() {
  try {
    console.log('--- SYNCING PRODUCTS TO NEGOCIO ID 4 ---')
    
    // Update all products from Negocio 2 to Negocio 4
    const res = await pool.query(
      "UPDATE productos SET negocio_id = 4 WHERE negocio_id = 2"
    )
    console.log(`Moved ${res.rowCount} products from Negocio 2 to Negocio 4`)
    
    // Also update categories from Negocio 2 to Negocio 4
    const catRes = await pool.query(
      "UPDATE categorias SET negocio_id = 4 WHERE negocio_id = 2"
    )
    console.log(`Moved ${catRes.rowCount} categories from Negocio 2 to Negocio 4`)

    console.log('\nSUCCESS: All products and categories aligned to Negocio ID 4.')
  } catch (err) {
    console.error('Error:', err)
  } finally {
    await pool.end()
  }
}

syncProductsToFour()
