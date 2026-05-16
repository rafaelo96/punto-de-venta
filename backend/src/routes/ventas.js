import { Router } from 'express'
import { query, pool } from '../db.js'
import { authenticate } from '../middleware/auth.js'
import validator from 'validator'
import crypto from 'crypto'


const router = Router()
router.use(authenticate)

const TICKET_SECRET = process.env.TICKET_SECRET || process.env.JWT_SECRET || 'ticket_secret_fallback'

function generateTicketToken(ventaId, negocioId) {
  const expiry = Math.floor(Date.now() / 1000) + 3600
  const payload = `${ventaId}:${negocioId}:${expiry}`
  const signature = crypto.createHmac('sha256', TICKET_SECRET).update(payload).digest('hex')
  return Buffer.from(`${payload}:${signature}`).toString('base64url')
}

function verifyTicketToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64url').toString()
    const [ventaId, negocioId, expiry, signature] = decoded.split(':')
    if (!ventaId || !negocioId || !expiry || !signature) return null
    if (Math.floor(Date.now() / 1000) > parseInt(expiry)) return null
    const expectedSig = crypto.createHmac('sha256', TICKET_SECRET).update(`${ventaId}:${negocioId}:${expiry}`).digest('hex')
    if (signature !== expectedSig) return null
    return { ventaId: parseInt(ventaId), negocioId: parseInt(negocioId) }
  } catch {
    return null
  }
}

function generarFolio() {
  const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `POS-${fecha}-${random}`
}

router.get('/historial', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, busqueda, limit = 50, offset = 0 } = req.query

    if (!validator.isInt(String(limit), { min: 1, max: 100 })) {
      return res.status(400).json({ message: 'Límite inválido' })
    }
    if (!validator.isInt(String(offset), { min: 0 })) {
      return res.status(400).json({ message: 'Offset inválido' })
    }
    if (fecha_inicio && !validator.isDate(fecha_inicio)) {
      return res.status(400).json({ message: 'Fecha inicio inválida' })
    }
    if (fecha_fin && !validator.isDate(fecha_fin)) {
      return res.status(400).json({ message: 'Fecha fin inválida' })
    }
    if (busqueda && !validator.isLength(busqueda, { max: 100 })) {
      return res.status(400).json({ message: 'Búsqueda muy larga' })
    }

    let sql = `
      SELECT v.id, v.total, v.metodo_pago, v.efectivo, v.cambio, v.status,
             v.created_at, v.negocio_id, v.usuario_id, u.nombre as usuario_nombre
      FROM ventas v
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      WHERE v.negocio_id = $1
    `
    const params = [req.negocioId]

    if (fecha_inicio && fecha_fin) {
      sql += ` AND v.created_at::date BETWEEN $${params.length + 1} AND $${params.length + 2}`
      params.push(fecha_inicio, fecha_fin)
    } else if (fecha_inicio) {
      sql += ` AND v.created_at::date >= $${params.length + 1}`
      params.push(fecha_inicio)
    } else if (fecha_fin) {
      sql += ` AND v.created_at::date <= $${params.length + 1}`
      params.push(fecha_fin)
    }
    
    console.log(`[Historial] SQL: ${sql} | Params: ${JSON.stringify(params)}`)

    if (busqueda) {
      sql += ` AND (CAST(v.id AS TEXT) LIKE $${params.length + 1} OR u.nombre ILIKE $${params.length + 1})`
      params.push(`%${busqueda}%`)
    }

    const limitVal = parseInt(limit)
    const offsetVal = parseInt(offset)
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
    if (!validator.isInt(req.params.id)) {
      return res.status(400).json({ message: 'ID inválido' })
    }
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

    res.json({ ...venta.rows[0], items: items.rows })
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
    if (!validator.isDate(fecha_inicio) || !validator.isDate(fecha_fin)) {
      return res.status(400).json({ message: 'Fechas inválidas' })
    }

    const general = await query(`
      SELECT
        COALESCE(SUM(v.total), 0) as total_ventas,
        COUNT(v.id) as num_tickets,
        COALESCE(SUM(v.efectivo), 0) as total_efectivo,
        COALESCE((SELECT SUM(cantidad) FROM ventas_items vi JOIN ventas v2 ON vi.venta_id = v2.id WHERE v2.negocio_id = $1 AND DATE(v2.created_at) BETWEEN $2 AND $3), 0) as total_productos
      FROM ventas v
      WHERE v.negocio_id = $1 AND DATE(v.created_at) BETWEEN $2 AND $3 AND v.status = 'completada'
    `, [req.negocioId, fecha_inicio, fecha_fin])

    const utilidad = await query(`
      SELECT COALESCE(SUM((vi.precio_unitario - p.precio_compra) * vi.cantidad), 0) as ganancia
      FROM ventas_items vi
      JOIN productos p ON vi.producto_id = p.id
      JOIN ventas v ON vi.venta_id = v.id
      WHERE v.negocio_id = $1 AND DATE(v.created_at) BETWEEN $2 AND $3 AND v.status = 'completada'
    `, [req.negocioId, fecha_inicio, fecha_fin])

    const topProductos = await query(`
      SELECT p.nombre, SUM(vi.cantidad) as cantidad, SUM(vi.precio_unitario * vi.cantidad) as total
      FROM ventas_items vi
      JOIN productos p ON vi.producto_id = p.id
      JOIN ventas v ON vi.venta_id = v.id
      WHERE v.negocio_id = $1 AND DATE(v.created_at) BETWEEN $2 AND $3 AND v.status = 'completada'
      GROUP BY p.id, p.nombre
      ORDER BY cantidad DESC
      LIMIT 10
    `, [req.negocioId, fecha_inicio, fecha_fin])

    const porCategoria = await query(`
      SELECT c.nombre as categoria, SUM(vi.precio_unitario * vi.cantidad) as total
      FROM ventas_items vi
      JOIN productos p ON vi.producto_id = p.id
      JOIN categorias c ON p.categoria_id = c.id
      JOIN ventas v ON vi.venta_id = v.id
      WHERE v.negocio_id = $1 AND DATE(v.created_at) BETWEEN $2 AND $3 AND v.status = 'completada'
      GROUP BY c.id, c.nombre
      ORDER BY total DESC
    `, [req.negocioId, fecha_inicio, fecha_fin])

    const porMetodo = await query(`
      SELECT metodo_pago as metodo, SUM(total) as total, COUNT(*) as cantidad
      FROM ventas
      WHERE negocio_id = $1 AND DATE(created_at) BETWEEN $2 AND $3 AND status = 'completada'
      GROUP BY metodo_pago
    `, [req.negocioId, fecha_inicio, fecha_fin])

    const ventasDiarias = await query(`
      SELECT DATE(created_at) as fecha, SUM(total) as total, COUNT(*) as tickets
      FROM ventas
      WHERE negocio_id = $1 AND DATE(created_at) BETWEEN $2 AND $3 AND status = 'completada'
      GROUP BY fecha
      ORDER BY fecha ASC
    `, [req.negocioId, fecha_inicio, fecha_fin])

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

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items requeridos' })
    }
    for (const item of items) {
      if (!validator.isInt(String(item.producto_id), { min: 1 })) {
        return res.status(400).json({ message: 'ID de producto inválido' })
      }
      if (!validator.isInt(String(item.cantidad), { min: 1 })) {
        return res.status(400).json({ message: 'Cantidad debe ser mayor a 0' })
      }
      if (!validator.isFloat(String(item.precio_unitario), { min: 0 })) {
        return res.status(400).json({ message: 'Precio unitario inválido' })
      }
      if (item.descuento !== undefined && !validator.isFloat(String(item.descuento), { min: 0, max: 100 })) {
        return res.status(400).json({ message: 'Descuento de producto inválido' })
      }
    }
    if (!['efectivo', 'tarjeta', 'transferencia', 'mixto'].includes(metodo_pago)) {
      return res.status(400).json({ message: 'Método de pago inválido' })
    }
    if (descuento_porcentaje !== undefined && (!validator.isFloat(String(descuento_porcentaje), { min: 0, max: 100 }))) {
      return res.status(400).json({ message: 'Descuento inválido' })
    }
    if (!validator.isFloat(String(total), { min: 0 })) {
      return res.status(400).json({ message: 'Total inválido' })
    }

    for (const item of items) {
      const producto = await client.query(
        'SELECT stock FROM productos WHERE id = $1 AND negocio_id = $2 FOR UPDATE',
        [item.producto_id, req.negocioId]
      )
      if (producto.rows.length === 0) {
        await client.query('ROLLBACK')
        return res.status(400).json({ message: `Producto ${item.producto_id} no encontrado` })
      }
      if (producto.rows[0].stock < item.cantidad) {
        await client.query('ROLLBACK')
        return res.status(400).json({
          message: `Stock insuficiente para el producto`,
          producto_id: item.producto_id,
          stock_actual: producto.rows[0].stock,
          cantidad_solicitada: item.cantidad
        })
      }
    }

    const folio = generarFolio()

    const ventaResult = await client.query(`
      INSERT INTO ventas (negocio_id, usuario_id, folio, total, descuento_porcentaje, metodo_pago, efectivo, cambio)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [req.negocioId, req.userId, folio, total, descuento_porcentaje || 0, metodo_pago, efectivo || 0, cambio || 0])

    const ventaId = ventaResult.rows[0].id

for (const item of items) {
    await client.query(`
      INSERT INTO ventas_items (venta_id, producto_id, cantidad, precio_unitario, descuento_porcentaje)
      VALUES ($1, $2, $3, $4, $5)
    `, [ventaId, item.producto_id, item.cantidad, item.precio_unitario, item.descuento || 0])

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

router.post('/cancelar/:id', async (req, res) => {
  const client = await pool.connect()
  try {
    if (!validator.isInt(req.params.id)) {
      return res.status(400).json({ message: 'ID inválido' })
    }
    const { motivo } = req.body
    if (!motivo || !validator.isLength(motivo, { min: 1, max: 500 })) {
      return res.status(400).json({ message: 'Motivo requerido (máx 500 caracteres)' })
    }

    await client.query('BEGIN')

    const venta = await client.query(
      'SELECT * FROM ventas WHERE id = $1 AND negocio_id = $2 AND status = $3 FOR UPDATE',
      [req.params.id, req.negocioId, 'completada']
    )
    if (venta.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ message: 'Venta no encontrada o ya cancelada' })
    }

    const items = await client.query(
      'SELECT * FROM ventas_items WHERE venta_id = $1',
      [req.params.id]
    )

    for (const item of items.rows) {
      await client.query(`
        UPDATE productos
        SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [item.cantidad, item.producto_id])
    }

    await client.query(`
      INSERT INTO ventas_canceladas (venta_original_id, negocio_id, usuario_id, motivo, total)
      VALUES ($1, $2, $3, $4, $5)
    `, [req.params.id, req.negocioId, req.userId, motivo, venta.rows[0].total])

    await client.query(`
      UPDATE ventas SET status = 'cancelada' WHERE id = $1
    `, [req.params.id])

    await client.query('COMMIT')

    res.json({ message: 'Venta cancelada correctamente' })
  } catch (error) {
    await client.query('ROLLBACK')
    res.status(500).json({ message: 'Error al cancelar venta', error: error.message })
  } finally {
    client.release()
  }
})

router.get('/stats/daily', async (req, res) => {
  try {
    const result = await query(`
      SELECT DATE(created_at) as fecha, SUM(total) as total, COUNT(*) as tickets
      FROM ventas
      WHERE negocio_id = $1 AND status = 'completada'
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

    const general = await query(`
      SELECT
        COALESCE(SUM(v.total), 0) as total_ventas,
        COUNT(v.id) as num_tickets,
        COALESCE(SUM(v.efectivo), 0) as total_efectivo,
        COALESCE((SELECT SUM(cantidad) FROM ventas_items vi JOIN ventas v2 ON vi.venta_id = v2.id WHERE v2.negocio_id = $1 AND DATE(v2.created_at) = $2 AND v2.status = 'completada'), 0) as total_productos
      FROM ventas v
      WHERE v.negocio_id = $1 AND DATE(v.created_at) = $2 AND v.status = 'completada'
    `, [req.negocioId, hoy])

    const utilidad = await query(`
      SELECT COALESCE(SUM((vi.precio_unitario - p.precio_compra) * vi.cantidad), 0) as ganancia
      FROM ventas_items vi
      JOIN productos p ON vi.producto_id = p.id
      JOIN ventas v ON vi.venta_id = v.id
      WHERE v.negocio_id = $1 AND DATE(v.created_at) = $2 AND v.status = 'completada'
    `, [req.negocioId, hoy])

    const topProductos = await query(`
      SELECT p.nombre, SUM(vi.cantidad) as cantidad, SUM(vi.precio_unitario * vi.cantidad) as total
      FROM ventas_items vi
      JOIN productos p ON vi.producto_id = p.id
      JOIN ventas v ON vi.venta_id = v.id
      WHERE v.negocio_id = $1 AND DATE(v.created_at) = $2 AND v.status = 'completada'
      GROUP BY p.id, p.nombre
      ORDER BY cantidad DESC
      LIMIT 5
    `, [req.negocioId, hoy])

    const porCategoria = await query(`
      SELECT c.nombre as categoria, SUM(vi.precio_unitario * vi.cantidad) as total
      FROM ventas_items vi
      JOIN productos p ON vi.producto_id = p.id
      JOIN categorias c ON p.categoria_id = c.id
      JOIN ventas v ON vi.venta_id = v.id
      WHERE v.negocio_id = $1 AND DATE(v.created_at) = $2 AND v.status = 'completada'
      GROUP BY c.id, c.nombre
      ORDER BY total DESC
    `, [req.negocioId, hoy])

    const porMetodo = await query(`
      SELECT metodo_pago as metodo, SUM(total) as total
      FROM ventas
      WHERE negocio_id = $1 AND DATE(created_at) = $2 AND status = 'completada'
      GROUP BY metodo_pago
    `, [req.negocioId, hoy])

    const stockBajo = await query(`
      SELECT id, nombre, stock, stock_minimo
      FROM productos
      WHERE negocio_id = $1 AND stock <= stock_minimo AND activo = true
      ORDER BY stock ASC
      LIMIT 10
    `, [req.negocioId])
    
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
      metodos: porMetodo.rows,
      stock_bajo: stockBajo.rows
    })
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener analytics', error: error.message })
  }
})

router.get('/ticket-token/:id', async (req, res) => {
  try {
    if (!validator.isInt(req.params.id)) {
      return res.status(400).json({ message: 'ID inválido' })
    }
    const venta = await query('SELECT id, negocio_id FROM ventas WHERE id = $1 AND negocio_id = $2', [req.params.id, req.negocioId])
    if (venta.rows.length === 0) {
      return res.status(404).json({ message: 'Venta no encontrada' })
    }
    const token = generateTicketToken(parseInt(req.params.id), req.negocioId)
    res.json({ token })
  } catch (error) {
    res.status(500).json({ message: 'Error al generar token', error: error.message })
  }
})

router.get('/ticket/:id', async (req, res) => {
  try {
    if (!validator.isInt(req.params.id)) {
      return res.status(400).json({ message: 'ID inválido' })
    }

    const format = req.query.format || 'html'

    let negocioId = req.negocioId

    if (!negocioId) {
      const ticketToken = req.query.token
      if (ticketToken) {
        const verified = verifyTicketToken(ticketToken)
        if (!verified || verified.ventaId !== parseInt(req.params.id)) {
          return res.status(401).json({ message: 'Token de ticket inválido o expirado' })
        }
        negocioId = verified.negocioId
      }
    }

    if (!negocioId) {
      return res.status(401).json({ message: 'No autorizado' })
    }
    
    const venta = await query(`
      SELECT v.*, u.nombre as usuario_nombre, n.nombre as negocio_nombre,
             n.logo as negocio_logo, n.color_principal,
             c.valor as direccion_negocio, t.valor as telefono_negocio
      FROM ventas v
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      LEFT JOIN negocios n ON v.negocio_id = n.id
      LEFT JOIN configuraciones c ON c.negocio_id = n.id AND c.clave = 'direccion_negocio'
      LEFT JOIN configuraciones t ON t.negocio_id = n.id AND t.clave = 'telefono_negocio'
      WHERE v.id = $1 AND v.negocio_id = $2
    `, [req.params.id, negocioId])
    
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
    
    // Convertir valores numéricos (vienen como strings desde PostgreSQL)
    v.total = parseFloat(v.total) || 0
    v.efectivo = parseFloat(v.efectivo) || 0
    v.cambio = parseFloat(v.cambio) || 0
    v.descuento_porcentaje = parseFloat(v.descuento_porcentaje) || 0
    
    if (format === 'escpos') {
      const escpos = generateESCPOS(v, items.rows)
      res.setHeader('Content-Type', 'application/octet-stream')
      res.send(Buffer.from(escpos))
    } else {
      let logoUrl = ''
      if (v.negocio_logo) {
        logoUrl = v.negocio_logo.startsWith('/uploads') ? v.negocio_logo : `/uploads${v.negocio_logo}`
      }

      const escapeHtml = (str) => {
        if (!str) return ''
        return String(str).replace(/&/g,'&').replace(/</g,'<').replace(/>/g,'>').replace(/"/g,'"')
      }

      const negocioNombre = escapeHtml(v.negocio_nombre || 'Punto de Venta')
      const direccion = escapeHtml(v.direccion_negocio || '')
      const telefono = escapeHtml(v.telefono_negocio || '')
      const usuario = escapeHtml(v.usuario_nombre || '-')
      const fecha = new Date(v.created_at).toLocaleString('es-MX')
      const itemsHtml = items.rows.map(item => {
        const p = parseFloat(item.precio_unitario) || 0
        const q = parseInt(item.cantidad) || 0
        const nombre = escapeHtml(item.producto_nombre || '')
        return `<tr><td>${q}x ${nombre}</td><td style="text-align:right">$${(p * q).toFixed(2)}</td></tr>`
      }).join('')
      const descHtml = v.descuento_porcentaje > 0 ? `<tr><td>Descuento: ${v.descuento_porcentaje}%</td><td></td></tr>` : ''
      const cambioHtml = v.metodo_pago === 'efectivo'
        ? `<tr><td>Efectivo: $${parseFloat(v.efectivo).toFixed(2)}</td><td></td></tr><tr><td>Cambio: $${parseFloat(v.cambio).toFixed(2)}</td><td></td></tr>`
        : ''

      let html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Ticket #${v.id}</title>
<style>
*{margin:0;padding:0;font-family:'Courier New',monospace;font-size:12px;line-height:1.4}
@media print{@page{size:80mm auto;margin:0}body{width:72mm;padding:2mm}}
body{width:72mm;padding:2mm;margin:0;color:#000;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.c{text-align:center}.b{font-weight:bold}
table{width:100%;border-collapse:collapse}td{padding:2px 0}
.d{border-top:1px dashed #999;margin:4px 0}
</style></head><body>
<div class="c">
${logoUrl ? `<img src="${logoUrl}" style="max-width:50mm;max-height:15mm;margin-bottom:4px" />` : ''}
<div class="b">${negocioNombre}</div>
${direccion ? `<div>${direccion}</div>` : ''}
${telefono ? `<div>${telefono}</div>` : ''}
</div>
<div class="d"></div>
Ticket #${v.id}<br/>
${fecha}<br/>
Cajero: ${usuario}
${v.status === 'cancelada' ? '<br/><span class="b" style="color:red">*** CANCELADA ***</span>' : ''}
<div class="d"></div>
<table>${itemsHtml}${descHtml}</table>
<div class="d"></div>
<table><tr><td class="b">TOTAL</td><td class="b" style="text-align:right">$${v.total.toFixed(2)}</td></tr></table>
Metodo: ${v.metodo_pago.toUpperCase()}${cambioHtml}
<div class="c" style="margin-top:10px">
*** Gracias por su compra ***<br/>
${new Date().getFullYear()} - POS System
</div>
<script>window.onload=function(){setTimeout(function(){window.print()},500)}</script>
</body></html>`
      
      res.send(html)
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al generar ticket', error: error.message })
  }
})

function generateESCPOS(venta, items) {
  const ESC = 0x1B
  const GS = 0x1D
  const LF = 0x0A
  let cmds = []
  
  cmds.push([ESC, 0x40])
  cmds.push([ESC, 0x61, 0x01])
  
  // Encabezado
  cmds.push(stringToBytes(venta.negocio_nombre || 'Punto de Venta'))
  cmds.push([LF])
  if (venta.direccion_negocio) {
    cmds.push(stringToBytes(venta.direccion_negocio))
    cmds.push([LF])
  }
  if (venta.telefono_negocio) {
    cmds.push(stringToBytes(venta.telefono_negocio))
    cmds.push([LF])
  }
  
  cmds.push([LF])
  cmds.push([ESC, 0x61, 0x00]) // Alinear a la izquierda
  
  // Divisor
  cmds.push(stringToBytes('------------------------------'))
  cmds.push([LF])
  
  // Info de venta
  cmds.push(stringToBytes(`Ticket #${venta.id}`))
  cmds.push([LF])
  cmds.push(stringToBytes(new Date(venta.created_at).toLocaleString('es-MX')))
  cmds.push([LF])
  cmds.push(stringToBytes(`Cajero: ${venta.usuario_nombre || '-'}`))
  cmds.push([LF])
  
  if (venta.status === 'cancelada') {
    cmds.push(stringToBytes('*** CANCELADA ***'))
    cmds.push([LF])
  }
  
  cmds.push(stringToBytes('------------------------------'))
  cmds.push([LF])
  
  // Items
  for (const item of items) {
    const cantidad = parseInt(item.cantidad) || 0
    const precio = parseFloat(item.precio_unitario) || 0
    const line = `${cantidad}x ${item.producto_nombre.substring(0, 20)}`
    const price = `$${(precio * cantidad).toFixed(2)}`
    cmds.push(stringToBytes(line.padEnd(30) + price))
    cmds.push([LF])
  }
  
  cmds.push(stringToBytes('------------------------------'))
  cmds.push([LF])
  
  // Total
  cmds.push([ESC, 0x45, 0x01]) // Negrita ON
  cmds.push(stringToBytes(`TOTAL: $${venta.total.toFixed(2)}`))
  cmds.push([LF])
  cmds.push([ESC, 0x45, 0x00]) // Negrita OFF
  cmds.push([LF])
  
  // Método de pago
  cmds.push(stringToBytes(`Método: ${venta.metodo_pago.toUpperCase()}`))
  cmds.push([LF])
  
  if (venta.metodo_pago === 'efectivo') {
    cmds.push(stringToBytes(`Efectivo: $${venta.efectivo.toFixed(2)}`))
    cmds.push([LF])
    cmds.push(stringToBytes(`Cambio: $${venta.cambio.toFixed(2)}`))
    cmds.push([LF])
  }
  
  cmds.push([LF])
  cmds.push([ESC, 0x61, 0x01]) // Centrar
  cmds.push(stringToBytes('*** Gracias por su compra ***'))
  cmds.push([LF])
  cmds.push(stringToBytes(new Date().getFullYear() + ' - POS System'))
  cmds.push([LF, LF, LF])
  
  // Cortar papel
  cmds.push([GS, 0x56, 0x41, 0x03])
  
  // Unir todos los comandos
  return cmds.flat()
}

function stringToBytes(str) {
  return Array.from(Buffer.from(str, 'utf8'))
}

// Export reports endpoint
router.get('/reportes/export', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, format } = req.query
    
    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({ message: 'Se requieren fecha_inicio y fecha_fin' })
    }
    
    // Get report data
    const reportes = await query(`
      SELECT 
        v.id, v.folio, v.total, v.metodo_pago, v.created_at,
        u.nombre as usuario_nombre
      FROM ventas v
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      WHERE v.negocio_id = $1 
        AND DATE(v.created_at) BETWEEN $2 AND $3
        AND v.status = 'completada'
      ORDER BY v.created_at DESC
    `, [req.negocioId, fecha_inicio, fecha_fin])
    
    if (format === 'excel') {
      // Generate Excel file
      const XLSX = require('xlsx')
      const ws = XLSX.utils.json_to_sheet(reportes.rows.map(r => ({
        'Folio': r.folio,
        'Fecha': new Date(r.created_at).toLocaleString('es-MX'),
        'Total': parseFloat(r.total),
        'Método': r.metodo_pago,
        'Usuario': r.usuario_nombre
      })))
      
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Ventas')
      
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', `attachment; filename="reporte_${fecha_inicio}_${fecha_fin}.xlsx"`)
      res.send(buf)
      
    } else if (format === 'pdf') {
      // Generate PDF (using puppeteer or similar)
      res.status(501).json({ message: 'PDF export coming soon' })
      
    } else {
      res.status(400).json({ message: 'Formato no válido. Use: excel o pdf' })
    }
    
  } catch (error) {
    console.error('Export error:', error)
    res.status(500).json({ message: 'Error al exportar', error: error.message })
  }
})

export default router