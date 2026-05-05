import { pool } from '../src/db.js'
import dotenv from 'dotenv'
dotenv.config()

async function checkNegocios() {
  try {
    const res = await pool.query('SELECT * FROM negocios')
    console.log('Existing Negocios:')
    res.rows.forEach(n => console.log(`- ID: ${n.id} | Name: ${n.nombre}`))
  } catch (err) {
    console.error('Error:', err)
  } finally {
    await pool.end()
  }
}

checkNegocios()
