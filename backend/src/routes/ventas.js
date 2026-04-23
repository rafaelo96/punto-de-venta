import { Router } from 'express'
import { query, pool } from '../db.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

function generarFolio() {
  const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `POS-${fecha}-${random}`
}

router.get('/historial', async (req, res) => {
  try {
    const result = await query(`
      SELECT v.*, u.nombre as usuario_nombre
      FROM ventas v
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      WHERE v.negocio_id = $1
      ORDER BY v.created_at DESC
      LIMIT 50
    `, [req.negocioId])
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener historial', error: error.message })
  }
})

router.post('/', async (req, res) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    
    const { items, metodo_pago, descuento_porcentaje, total, efectivo, cambio } = req.body
    
    const folio = generarFolio()
    
    const ventaResult = await client.query(`
      INSERT INTO ventas (negocio_id, usuario_id, folio, total, descuento_porcentaje, metodo_pago, efectivo, cambio)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [req.negocioId, req.userId, folio, total, descuento_porcentaje || 0, metodo_pago, efectivo || 0, cambio || 0])
    
    const ventaId = ventaResult.rows[0].id
    
    for (const item of items) {
      await client.query(`
        INSERT INTO ventas_items (venta_id, producto_id, cantidad, precio_unitario)
        VALUES ($1, $2, $3, $4)
      `, [ventaId, item.producto_id, item.cantidad, item.precio_unitario])
      
      await client.query(`
        UPDATE productos 
        SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND negocio_id = $3
      `, [item.cantidad, item.producto_id, req.negocioId])
    }
    
    await client.query('COMMIT')
    
    res.json(ventaResult.rows[0])
  } catch (error) {
    await client.query('ROLLBACK')
    res.status(500).json({ message: 'Error al registrar venta', error: error.message })
  } finally {
    client.release()
  }
})

router.get('/dashboard', async (req, res) => {
  try {
    const hoy = new Date().toISOString().slice(0, 10)
    
    const ventasHoy = await query(`
      SELECT COALESCE(SUM(total), 0) as total, COUNT(*) as count, COALESCE(SUM(efectivo), 0) as efectivo
      FROM ventas 
      WHERE negocio_id = $1 AND DATE(created_at) = $2
    `, [req.negocioId, hoy])
    
    const productosVendidos = await query(`
      SELECT COALESCE(SUM(vi.cantidad), 0) as total
      FROM ventas_items vi
      JOIN ventas v ON vi.venta_id = v.id
      WHERE v.negocio_id = $1 AND DATE(v.created_at) = $2
    `, [req.negocioId, hoy])
    
    res.json({
      ventas_hoy: parseFloat(ventasHoy.rows[0].total),
      tickets_hoy: parseInt(ventasHoy.rows[0].count),
      productos_vendidos: parseInt(productosVendidos.rows[0].total),
      efectivo: parseFloat(ventasHoy.rows[0].efectivo)
    })
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener dashboard', error: error.message })
  }
})

export default router