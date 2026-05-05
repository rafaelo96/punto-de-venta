import { pool } from '../src/db.js'
import dotenv from 'dotenv'
dotenv.config()

async function debugAuth() {
  try {
    console.log('--- DEBUGGING AUTH CONSISTENCY ---')
    
    const userRes = await pool.query('SELECT * FROM usuarios WHERE email = $1', ['test@pos.com'])
    if (userRes.rows.length === 0) {
      console.error('User not found')
      return
    }
    const user = userRes.rows[0]
    console.log(`DB User: ${user.email} | ID: ${user.id} | NegocioID: ${user.negocio_id}`)
    
    const negRes = await pool.query('SELECT * FROM negocios')
    console.log('\nAll Businesses in DB:')
    negRes.rows.forEach(n => console.log(`- ID: ${n.id} | Name: ${n.nombre} | Slug: ${n.slug}`))
    
    const salesRes = await pool.query('SELECT negocio_id, count(*) FROM ventas GROUP BY negocio_id')
    console.log('\nSales distribution by NegocioID:')
    salesRes.rows.forEach(r => console.log(`- Negocio ${r.negocio_id}: ${r.count} sales`))
  } catch (err) {
    console.error('Error:', err)
  } finally {
    await pool.end()
  }
}

debugAuth()
