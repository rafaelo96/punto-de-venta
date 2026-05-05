import { pool } from '../src/db.js'
import dotenv from 'dotenv'
dotenv.config()

async function totalAudit() {
  try {
    console.log('--- TOTAL DB AUDIT ---')
    
    const allSales = await pool.query('SELECT id, negocio_id, usuario_id, created_at FROM ventas')
    console.log(`Total rows in ventas table: ${allSales.rows.length}`)
    
    const negocioDist = await pool.query('SELECT negocio_id, count(*) FROM ventas GROUP BY negocio_id')
    console.log('\nSales per Negocio:')
    negocioDist.rows.forEach(r => console.log(`- Negocio ${r.negocio_id}: ${r.count}`))
    
    const userDist = await pool.query('SELECT usuario_id, count(*) FROM ventas GROUP BY usuario_id')
    console.log('\nSales per User:')
    userDist.rows.forEach(r => console.log(`- User ${r.usuario_id}: ${r.count}`))

  } catch (err) {
    console.error('Error:', err)
  } finally {
    await pool.end()
  }
}

totalAudit()
