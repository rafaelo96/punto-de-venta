import { pool } from '../src/db.js'
import dotenv from 'dotenv'
import fs from 'fs'
dotenv.config()

async function dumpSales() {
  try {
    const res = await pool.query('SELECT * FROM ventas')
    fs.writeFileSync('/tmp/all_sales.json', JSON.stringify(res.rows, null, 2))
    console.log(`Dumped ${res.rows.length} sales to /tmp/all_sales.json`)
  } catch (err) {
    console.error('Error:', err)
  } finally {
    await pool.end()
  }
}

dumpSales()
