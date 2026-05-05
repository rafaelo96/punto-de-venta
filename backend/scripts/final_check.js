import { pool } from '../src/db.js'
import dotenv from 'dotenv'
dotenv.config()

async function finalCheck() {
  try {
    console.log('--- FINAL DB STATE CHECK ---')
    
    const salesCount = await pool.query('SELECT count(*) FROM ventas')
    console.log(`Total sales in DB: ${salesCount.rows[0].count}`)
    
    const negocioSales = await pool.query('SELECT negocio_id, count(*) FROM ventas GROUP BY negocio_id')
    console.log('\nSales per Negocio ID:')
    negocioSales.rows.forEach(r => console.log(`- Negocio ${r.negocio_id}: ${r.count}`))
    
    const userSales = await pool.query('SELECT usuario_id, count(*) FROM ventas GROUP BY usuario_id')
    console.log('\nSales per Usuario ID:')
    userSales.rows.forEach(r => console.log(`- Usuario ${r.usuario_id}: ${r.count}`))
    
    const userRes = await pool.query('SELECT id, email, negocio_id FROM usuarios WHERE email = $1', ['test@pos.com'])
    if (userRes.rows.length > 0) {
      console.log(`\nTarget User (test@pos.com): ID ${userRes.rows[0].id}, NegocioID ${userRes.rows[0].negocio_id}`)
    }

  } catch (err) {
    console.error('Error:', err)
  } finally {
    await pool.end()
  }
}

finalCheck()
