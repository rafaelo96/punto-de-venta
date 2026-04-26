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

router.get('/stats/daily', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        DATE(created_at) as fecha, 
        SUM(total) as total,
        COUNT(*) as tickets
      FROM ventas 
      WHERE negocio_id = $1 
      GROUP BY fecha 
      ORDER BY fecha ASC 
      LIMIT 30
    `, [req.negocioId])
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener stats diarios', error: error.message })
  }
})

router.get('/dashboard', async (req, res) => {
  try {
    const hoy = new Date().toISOString().slice(0, 10)
    
    // 1. Métricas Generales
    const general = await query(`
      SELECT 
        COALESCE(SUM(v.total), 0) as total_ventas, 
        COUNT(v.id) as num_tickets, 
        COALESCE(SUM(v.efectivo), 0) as total_efectivo,
        COALESCE((SELECT SUM(cantidad) FROM ventas_items vi JOIN ventas v2 ON vi.venta_id = v2.id WHERE v2.negocio_id = $1 AND DATE(v2.created_at) = $2), 0) as total_productos
      FROM ventas v
      WHERE v.negocio_id = $1 AND DATE(v.created_at) = $2
    `, [req.negocioId, hoy])

    // 2. Utilidad Real (Ganancia Neta)
    const utilidad = await query(`
      SELECT COALESCE(SUM((vi.precio_unitario - p.precio_compra) * vi.cantidad), 0) as ganancia
      FROM ventas_items vi
      JOIN productos p ON vi.producto_id = p.id
      JOIN ventas v ON vi.venta_id = v.id
      WHERE v.negocio_id = $1 AND DATE(v.created_at) = $2
    `, [req.negocioId, hoy])

    // 3. Top 5 Productos más vendidos
    const topProductos = await query(`
      SELECT p.nombre, SUM(vi.cantidad) as cantidad, SUM(vi.precio_unitario * vi.cantidad) as total
      FROM ventas_items vi
      JOIN productos p ON vi.producto_id = p.id
      JOIN ventas v ON vi.venta_id = v.id
      WHERE v.negocio_id = $1 AND DATE(v.created_at) = $2
      GROUP BY p.id, p.nombre
      ORDER BY cantidad DESC
      LIMIT 5
    `, [req.negocioId, hoy])

    // 4. Ventas por Categoría
    const porCategoria = await query(`
      SELECT c.nombre as categoria, SUM(vi.precio_unitario * vi.cantidad) as total
      FROM ventas_items vi
      JOIN productos p ON vi.producto_id = p.id
      JOIN categorias c ON p.categoria_id = c.id
      JOIN ventas v ON vi.venta_id = v.id
      WHERE v.negocio_id = $1 AND DATE(v.created_at) = $2
      GROUP BY c.id, c.nombre
      ORDER BY total DESC
    `, [req.negocioId, hoy])

    // 5. Ventas por Método de Pago
    const porMetodo = await query(`
      SELECT metodo_pago as metodo, SUM(total) as total
      FROM ventas 
      WHERE negocio_id = $1 AND DATE(created_at) = $2
      GROUP BY metodo_pago
    `, [req.negocioId, hoy])

    res.json({
      resumen: {
        total: parseFloat(general.rows[0].total_ventas),
        tickets: parseInt(general.rows[0].num_tickets),
        efectivo: parseFloat(general.rows[0].total_efectivo),
        ganancia_neta: parseFloat(utilidad.rows[0].ganancia),
        productos_vendidos: parseInt(general.rows[0].total_productos)
      },
      top_productos: topProductos.rows,
      categorias: porCategoria.rows,
      metodos: porMetodo.rows
    })
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener analytics', error: error.message })
  }
})

export default router