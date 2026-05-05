import { pool } from '../src/db.js'
import dotenv from 'dotenv'
dotenv.config()

async function checkUsers() {
  try {
    const res = await pool.query('SELECT * FROM usuarios')
    console.log('All Users:')
    res.rows.forEach(u => console.log(`- ID: ${u.id} | Email: ${u.email} | Name: ${u.nombre} | NegocioID: ${u.negocio_id}`))
  } catch (err) {
    console.error('Error:', err)
  } finally {
    await pool.end()
  }
}

checkUsers()
