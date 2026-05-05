import { pool } from '../src/db.js'
import dotenv from 'dotenv'
dotenv.config()

async function checkEverything() {
  try {
    console.log('--- DATABASE CONSISTENCY CHECK ---')
    
    // 1. Check users
    const users = await pool.query('SELECT id, negocio_id, email FROM usuarios WHERE email = $1', ['test@pos.com'])
    console.log(`Users found for test@pos.com: ${users.rows.length}`)
    users.rows.forEach(u => console.log(`- User ID: ${u.id}, Negocio ID: ${u.negocio_id}`))
    
    // 2. Check sales distribution
    const salesDist = await pool.query('SELECT negocio_id, count(*) FROM ventas GROUP BY negocio_id')
    console.log('\nSales per Negocio ID:')
    salesDist.rows.forEach(r => console.log(`- Negocio ${r.negocio_id}: ${r.count} sales`))
    
    // 3. Check specifically for the inserted MASS sales
    const massSales = await pool.query('SELECT negocio_id, count(*) FROM ventas WHERE folio LIKE \'POS-MASS%\' GROUP BY negocio_id')
    console.log('\nPOS-MASS sales per Negocio ID:')
    massSales.rows.forEach(r => console.log(`- Negocio ${r.negocio_id}: ${r.count} sales`))
  } catch (err) {
    console.error('Error:', err)
  } finally {
    await pool.end()
  }
}

checkEverything()
