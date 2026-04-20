import { Router } from 'express'
import { query } from '../db.js'

const router = Router()

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    return res.status(401).json({ message: 'No autorizado' })
  }
  next()
}

router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        p.id, p.nombre, p.codigo_barras, p.categoria_id, p.stock, p.stock_minimo, p.activo,
        c.nombre as categoria_nombre,
        p.precio_compra::numeric(10,2) as precio_compra,
        p.precio_venta::numeric(10,2) as precio_venta
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.activo = true
      ORDER BY p.nombre
    `)
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos', error: error.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM productos WHERE id = $1', [req.params.id])
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' })
    }
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener producto', error: error.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { nombre, codigo_barras, categoria_id, precio_compra, precio_venta, stock, stock_minimo } = req.body
    
    const result = await query(`
      INSERT INTO productos (nombre, codigo_barras, categoria_id, precio_compra, precio_venta, stock, stock_minimo)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [nombre, codigo_barras, categoria_id, precio_compra, precio_venta, stock || 0, stock_minimo || 5])
    
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ message: 'Error al crear producto', error: error.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { nombre, codigo_barras, categoria_id, precio_compra, precio_venta, stock, stock_minimo, activo } = req.body
    
    const result = await query(`
      UPDATE productos 
      SET nombre = COALESCE($1, nombre),
          codigo_barras = COALESCE($2, codigo_barras),
          categoria_id = COALESCE($3, categoria_id),
          precio_compra = COALESCE($4, precio_compra),
          precio_venta = COALESCE($5, precio_venta),
          stock = COALESCE($6, stock),
          stock_minimo = COALESCE($7, stock_minimo),
          activo = COALESCE($8, activo),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `, [nombre, codigo_barras, categoria_id, precio_compra, precio_venta, stock, stock_minimo, activo, req.params.id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' })
    }
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar producto', error: error.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await query('UPDATE productos SET activo = false WHERE id = $1', [req.params.id])
    res.json({ message: 'Producto eliminado' })
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar producto', error: error.message })
  }
})

router.patch('/:id/stock', async (req, res) => {
  try {
    const { cantidad, tipo } = req.body
    const productoId = req.params.id
    
    let result
    if (tipo === 'entrada') {
      result = await query(`
        UPDATE productos 
        SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `, [cantidad, productoId])
    } else if (tipo === 'salida') {
      result = await query(`
        UPDATE productos 
        SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `, [cantidad, productoId])
    } else if (tipo === 'ajuste') {
      result = await query(`
        UPDATE productos 
        SET stock = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `, [cantidad, productoId])
    }
    
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ message: 'Error al ajustar stock', error: error.message })
  }
})

export default router