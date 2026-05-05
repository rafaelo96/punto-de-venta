import { pool } from '../src/db.js'
import dotenv from 'dotenv'
dotenv.config()

async function addMoreOldSales() {
  try {
    console.log('Adding high volume of old sales...')
    
    const userRes = await pool.query('SELECT id, negocio_id FROM usuarios WHERE email = $1', ['test@pos.com'])
    if (userRes.rows.length === 0) {
      console.error('User test@pos.com not found')
      return
    }
    const { id: usuarioId, negocio_id: negocioId } = userRes.rows[0]

    const prodRes = await pool.query('SELECT id, precio_venta FROM productos WHERE negocio_id = $1 LIMIT 20', [negocioId])
    const products = prodRes.rows
    if (products.length === 0) {
      console.error('No products found')
      return
    }

    const today = new Date()
    let totalInsertions = 0

    for (let i = 1; i <= 15; i++) {
      const date = new Date()
      date.setDate(today.getDate() - i)
      
      // High volume: 5 to 15 sales per day
      const salesPerDay = Math.floor(Math.random() * 11) + 5 
      
      for (let j = 0; j < salesPerDay; j++) {
        // 1 to 5 items per sale
        const numItems = Math.floor(Math.random() * 5) + 1
        let total = 0
        const items = []

        for (let k = 0; k < numItems; k++) {
          const prod = products[Math.floor(Math.random() * products.length)]
          const qty = Math.floor(Math.random() * 3) + 1
          const price = parseFloat(prod.precio_venta)
          total += price * qty
          items.push({
            producto_id: prod.id,
            cantidad: qty,
            precio_unitario: price
          })
        }

        const folio = `POS-MASS-${date.toISOString().slice(0,10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000)}`
        
        const ventaRes = await pool.query(
          'INSERT INTO ventas (negocio_id, usuario_id, folio, total, metodo_pago, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
          [negocioId, usuarioId, folio, total, 'efectivo', 'completada', date.toISOString()]
        )
        const ventaId = ventaRes.rows[0].id

        for (const item of items) {
          await pool.query(
            'INSERT INTO ventas_items (venta_id, producto_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
            [ventaId, item.producto_id, item.cantidad, item.precio_unitario]
          )
        }
        totalInsertions++
      }
      console.log(`Day ${i} ago: added ${salesPerDay} sales`)
    }

    console.log(`\nFinished! Added ${totalInsertions} sales total across 15 days.`)
  } catch (err) {
    console.error('Error adding sales:', err)
  } finally {
    await pool.end()
  }
}

addMoreOldSales()
