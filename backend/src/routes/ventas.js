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
    const { fecha_inicio, fecha_fin, busqueda, limit = 50, offset = 0 } = req.query
    
    let sql = `
      SELECT v.id, v.total, v.metodo_pago, v.efectivo, v.created_at, v.negocio_id, v.usuario_id, u.nombre as usuario_nombre
      FROM ventas v
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      WHERE v.negocio_id = $1
    `
    const params = [req.negocioId]
    
    if (fecha_inicio && fecha_fin) {
      sql += ` AND DATE(v.created_at) BETWEEN $2 AND $3`
      params.push(fecha_inicio, fecha_fin)
    } else if (fecha_inicio) {
      sql += ` AND DATE(v.created_at) >= $2`
      params.push(fecha_inicio)
    } else if (fecha_fin) {
      sql += ` AND DATE(v.created_at) <= $2`
      params.push(fecha_fin)
    }
    
    if (busqueda) {
      sql += ` AND (CAST(v.id AS TEXT) LIKE $${params.length + 1} OR u.nombre ILIKE $${params.length + 1})`
      params.push(`%${busqueda}%`)
    }
    
    const limitVal = parseInt(limit) || 50
    const offsetVal = parseInt(offset) || 0
    sql += ` ORDER BY v.created_at DESC LIMIT ${limitVal} OFFSET ${offsetVal}`
    
    const result = await query(sql, params)
    res.json(result.rows)
  } catch (error) {
    console.error('Error historial:', error)
    res.status(500).json({ message: 'Error al obtener historial', error: error.message })
  }
})

router.get('/historial/:id', async (req, res) => {
  try {
    const venta = await query(`
      SELECT v.*, u.nombre as usuario_nombre
      FROM ventas v
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      WHERE v.id = $1 AND v.negocio_id = $2
    `, [req.params.id, req.negocioId])
    
    if (venta.rows.length === 0) {
      return res.status(404).json({ message: 'Venta no encontrada' })
    }
    
    const items = await query(`
      SELECT vi.*, p.nombre as producto_nombre
      FROM ventas_items vi
      LEFT JOIN productos p ON vi.producto_id = p.id
      WHERE vi.venta_id = $1
    `, [req.params.id])
    
    res.json({
      ...venta.rows[0],
      items: items.rows
    })
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener venta', error: error.message })
  }
})

router.get('/reportes', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query
    
    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({ message: 'Se requieren fecha_inicio y fecha_fin' })
    }
    
    // Métricas generales del período
    const general = await query(`
      SELECT 
        COALESCE(SUM(v.total), 0) as total_ventas, 
        COUNT(v.id) as num_tickets, 
        COALESCE(SUM(v.efectivo), 0) as total_efectivo,
        COALESCE((SELECT SUM(cantidad) FROM ventas_items vi JOIN ventas v2 ON vi.venta_id = v2.id WHERE v2.negocio_id = $1 AND DATE(v2.created_at) BETWEEN $2 AND $3), 0) as total_productos
      FROM ventas v
      WHERE v.negocio_id = $1 AND DATE(v.created_at) BETWEEN $2 AND $3
    `, [req.negocioId, fecha_inicio, fecha_fin])
    
    // Utilidad/gencia
    const utilidad = await query(`
      SELECT COALESCE(SUM((vi.precio_unitario - p.precio_compra) * vi.cantidad), 0) as ganancia
      FROM ventas_items vi
      JOIN productos p ON vi.producto_id = p.id
      JOIN ventas v ON vi.venta_id = v.id
      WHERE v.negocio_id = $1 AND DATE(v.created_at) BETWEEN $2 AND $3
    `, [req.negocioId, fecha_inicio, fecha_fin])
    
    // Top productos
    const topProductos = await query(`
      SELECT p.nombre, SUM(vi.cantidad) as cantidad, SUM(vi.precio_unitario * vi.cantidad) as total
      FROM ventas_items vi
      JOIN productos p ON vi.producto_id = p.id
      JOIN ventas v ON vi.venta_id = v.id
      WHERE v.negocio_id = $1 AND DATE(v.created_at) BETWEEN $2 AND $3
      GROUP BY p.id, p.nombre
      ORDER BY cantidad DESC
      LIMIT 10
    `, [req.negocioId, fecha_inicio, fecha_fin])
    
    // Por categoría
    const porCategoria = await query(`
      SELECT c.nombre as categoria, SUM(vi.precio_unitario * vi.cantidad) as total
      FROM ventas_items vi
      JOIN productos p ON vi.producto_id = p.id
      JOIN categorias c ON p.categoria_id = c.id
      JOIN ventas v ON vi.venta_id = v.id
      WHERE v.negocio_id = $1 AND DATE(v.created_at) BETWEEN $2 AND $3
      GROUP BY c.id, c.nombre
      ORDER BY total DESC
    `, [req.negocioId, fecha_inicio, fecha_fin])
    
    // Por método de pago
    const porMetodo = await query(`
      SELECT metodo_pago as metodo, SUM(total) as total, COUNT(*) as cantidad
      FROM ventas 
      WHERE negocio_id = $1 AND DATE(created_at) BETWEEN $2 AND $3
      GROUP BY metodo_pago
    `, [req.negocioId, fecha_inicio, fecha_fin])
    
    // Ventas diarias
    const ventasDiarias = await query(`
      SELECT 
        DATE(created_at) as fecha, 
        SUM(total) as total,
        COUNT(*) as tickets
      FROM ventas 
      WHERE negocio_id = $1 AND DATE(created_at) BETWEEN $2 AND $3
      GROUP BY fecha
      ORDER BY fecha ASC
    `, [req.negocioId, fecha_inicio, fecha_fin])
    
    // Productos con bajo stock al final del período
    const stockBajo = await query(`
      SELECT id, nombre, stock, stock_minimo
      FROM productos 
      WHERE negocio_id = $1 AND stock <= stock_minimo AND activo = true
      ORDER BY stock ASC
      LIMIT 10
    `, [req.negocioId])
    
    res.json({
      periodo: { inicio: fecha_inicio, fin: fecha_fin },
      resumen: {
        total_ventas: parseFloat(general.rows[0].total_ventas),
        num_tickets: parseInt(general.rows[0].num_tickets),
        total_efectivo: parseFloat(general.rows[0].total_efectivo),
        productos_vendidos: parseInt(general.rows[0].total_productos),
        ganancia_neta: parseFloat(utilidad.rows[0].ganancia)
      },
      top_productos: topProductos.rows,
      categorias: porCategoria.rows,
      metodos: porMetodo.rows,
      ventas_diarias: ventasDiarias.rows,
      stock_bajo: stockBajo.rows
    })
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener reportes', error: error.message })
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

router.get('/ticket/:id', async (req, res) => {
  try {
    const venta = await query(`
      SELECT v.*, u.nombre as usuario_nombre, n.nombre_negocio, n.direccion as negocio_direccion, n.telefono as negocio_telefono, n.logo as negocio_logo
      FROM ventas v
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      LEFT JOIN negocios n ON v.negocio_id = n.id
      WHERE v.id = $1 AND v.negocio_id = $2
    `, [req.params.id, req.negocioId])
    
    if (venta.rows.length === 0) {
      return res.status(404).json({ message: 'Venta no encontrada' })
    }
    
    const items = await query(`
      SELECT vi.*, p.nombre as producto_nombre
      FROM ventas_items vi
      LEFT JOIN productos p ON vi.producto_id = p.id
      WHERE vi.venta_id = $1
    `, [req.params.id])
    
    const v = venta.rows[0]
    
    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Ticket #${v.id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'IBM Plex Sans', sans-serif; }
    body { width: 280px; padding: 20px; font-size: 12px; }
    .header { text-align: center; margin-bottom: 15px; }
    .logo { width: 60px; height: 60px; object-fit: contain; margin-bottom: 10px; }
    h1 { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
    .info { font-size: 10px; color: #666; margin-bottom: 10px; }
    .divider { border-bottom: 1px dashed #ccc; margin: 10px 0; }
    .item { display: flex; justify-content: space-between; margin: 5px 0; }
    .item-name { flex: 1; }
    .item-price { margin-left: 10px; }
    .total { display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; margin-top: 10px; }
    .footer { text-align: center; font-size: 10px; color: #999; margin-top: 20px; }
    @media print { body { width: auto; } }
  </style>
</head>
<body>
  <div class="header">
    ${v.negocio_logo ? `<img src="${req.protocol}://${req.get('host')}/uploads/${v.negocio_logo}" class="logo" />` : ''}
    <h1>${v.nombre_negocio || 'Punto de Venta'}</h1>
    <p class="info">${v.negocio_direccion || ''}</p>
    <p class="info">${v.negocio_telefono || ''}</p>
  </div>
  <p><strong>Ticket #${v.id}</strong></p>
  <p class="info">${new Date(v.created_at).toLocaleString('es-MX')}</p>
  <p class="info">Cajero: ${v.usuario_nombre || '-'}</p>
  <div class="divider"></div>
`
    
    for (const item of items.rows) {
      html += `
  <div class="item">
    <span class="item-name">${item.cantidad}x ${item.producto_nombre}</span>
    <span class="item-price">$${item.precio_unitario * item.cantidad}</span>
  </div>
`
    }
    
    html += `
  <div class="divider"></div>
  <div class="total">
    <span>TOTAL</span>
    <span>$${v.total.toFixed(2)}</span>
  </div>
  <p style="margin-top:5px;font-size:10px;color:#666">Método: ${v.metodo_pago}</p>
  <div class="footer">
    <p>Gracias por su compra</p>
  </div>
</body>
</html>
`
    
    res.send(html)
  } catch (error) {
    res.status(500).json({ message: 'Error al generar ticket', error: error.message })
  }
})

export default router