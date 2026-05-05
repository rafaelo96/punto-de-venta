import { pool } from '../src/db.js'
import dotenv from 'dotenv'
dotenv.config()

async function listProducts() {
  try {
    // 1. Find the negocio_id for test@pos.com
    const userRes = await pool.query('SELECT negocio_id FROM usuarios WHERE email = $1', ['test@pos.com'])
    if (userRes.rows.length === 0) {
      console.error('User test@pos.com not found')
      return
    }
    const negocioId = userRes.rows[0].negocio_id
    console.log(`Fetching products for Negocio ID: ${negocioId}\n`)

    // 2. Fetch products with their categories
    const prodRes = await pool.query(`
      SELECT p.nombre, p.precio_venta, p.stock, c.nombre as categoria
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.negocio_id = $1
      ORDER BY p.nombre ASC
    `, [negocioId])

    if (prodRes.rows.length === 0) {
      console.log('No products found for this business.')
      return
    }

    console.log('---------------------------------------------------------------------------')
    console.log(`${'Producto'.padEnd(30)} | ${'Categoría'.padEnd(20)} | ${'Precio'.padEnd(10)} | ${'Stock'}`)
    console.log('---------------------------------------------------------------------------')
    prodRes.rows.forEach(p => {
      console.log(`${p.nombre.padEnd(30)} | ${(p.categoria || 'Sin Cat').padEnd(20)} | $${p.precio_venta.toString().padEnd(9)} | ${p.stock}`)
    })
    console.log('---------------------------------------------------------------------------')
    console.log(`Total products: ${prodRes.rows.length}`)

  } catch (err) {
    console.error('Error:', err)
  } finally {
    await pool.end()
  }
}

listProducts()
