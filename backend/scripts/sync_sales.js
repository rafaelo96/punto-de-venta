import { pool } from '../src/db.js'
import dotenv from 'dotenv'
dotenv.config()

async function syncSalesToCorrectNegocio() {
  try {
    console.log('Syncing sales to correct negocio_id...')
    
    // 1. Get the CURRENT negocio_id for test@pos.com from the DB
    const userRes = await pool.query('SELECT id, negocio_id FROM usuarios WHERE email = $1', ['test@pos.com'])
    if (userRes.rows.length === 0) {
      console.error('User test@pos.com not found')
      return
    }
    const { id: usuarioId, negocio_id: correctNegocioId } = userRes.rows[0]
    console.log(`Actual DB User ID: ${usuarioId}, Correct Negocio ID: ${correctNegocioId}`)

    // 2. Update all POS-MASS sales to use this correct negocio_id and usuario_id
    const updateRes = await pool.query(
      "UPDATE ventas SET negocio_id = $1, usuario_id = $2 WHERE folio LIKE 'POS-MASS%'",
      [correctNegocioId, usuarioId]
    )
    console.log(`Updated ${updateRes.rowCount} sales to Negocio ID ${correctNegocioId}`)

    // 3. Also update associated items just in case (though they refer to venta_id)
    // No need to update items, they are linked to venta_id.

    console.log('Sync complete!')
  } catch (err) {
    console.error('Error syncing sales:', err)
  } finally {
    await pool.end()
  }
}

syncSalesToCorrectNegocio()
