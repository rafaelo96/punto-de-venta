import { pool } from '../src/db.js'
import dotenv from 'dotenv'
dotenv.config()

async function debugApiLogic() {
  try {
    console.log('--- MIMICKING API LOGIC ---')
    const negocioId = 4
    const fechaInicio = '2026-04-02'
    
    let sql = `
      SELECT v.id, v.total, v.metodo_pago, v.efectivo, v.cambio, v.status,
             v.created_at, v.negocio_id, v.usuario_id, u.nombre as usuario_nombre
      FROM ventas v
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      WHERE v.negocio_id = $1
    `
    const params = [negocioId]
    sql += ` AND DATE(v.created_at) >= $${params.length + 1}`
    params.push(fechaInicio)
    sql += ` ORDER BY v.created_at DESC LIMIT 100 OFFSET 0`
    
    console.log('Executing SQL:', sql)
    const result = await pool.query(sql, params)
    console.log(`Rows returned by DB: ${result.rows.length}`)
    
    if (result.rows.length > 0) {
      console.log('First row sample:', result.rows[0])
    }
  } catch (err) {
    console.error('Error:', err)
  } finally {
    await pool.end()
  }
}

debugApiLogic()
