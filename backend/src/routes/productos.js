import { Router } from 'express'
import { query } from '../db.js'
import { authenticate } from '../middleware/auth.js'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const router = Router()
router.use(authenticate)

const getStoragePath = (negocioId) => {
  const storageDir = path.join(__dirname, `../../uploads/${negocioId}/productos`)
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true })
  }
  return storageDir
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, getStoragePath(req.negocioId)),
  filename: (req, file, cb) => cb(null, `producto_${req.params.id}${path.extname(file.originalname)}`)
})

const uploadProducto = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } })

router.post('/:id/imagen', uploadProducto.single('imagen'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se recibió imagen' })
    }
    const imagenPath = `/uploads/1/productos/${req.file.filename}`
    const result = await query(`
      UPDATE productos 
      SET imagen = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [imagenPath, req.params.id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' })
    }
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ message: 'Error al subir imagen', error: error.message })
  }
})

router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        p.id, p.nombre, p.codigo_barras, p.categoria_id, p.stock, p.stock_minimo, p.activo, p.imagen,
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

router.put('/:id/imagen', async (req, res) => {
  try {
    const { imagen } = req.body
    
    const result = await query(`
      UPDATE productos 
      SET imagen = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [imagen, req.params.id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' })
    }
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar imagen', error: error.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM productos WHERE id = $1',
      [req.params.id]
    )
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
      INSERT INTO productos (negocio_id, nombre, codigo_barras, categoria_id, precio_compra, precio_venta, stock, stock_minimo)
      VALUES (1, $1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [nombre, codigo_barras, categoria_id, precio_compra, precio_venta, stock || 0, stock_minimo || 5])
    
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ message: 'Error al crear producto', error: error.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { nombre, codigo_barras, categoria_id, precio_compra, precio_venta, stock, stock_minimo, activo, imagen } = req.body
    
    const existe = await query('SELECT id FROM productos WHERE id = $1', [req.params.id])
    if (existe.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' })
    }
    
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
          imagen = $9,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
    `, [nombre, codigo_barras, categoria_id, precio_compra, precio_venta, stock, stock_minimo, activo, imagen, req.params.id])
    
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar producto', error: error.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const result = await query(
      'UPDATE productos SET activo = false WHERE id = $1',
      [req.params.id]
    )
    res.json({ message: 'Producto eliminado' })
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar producto', error: error.message })
  }
})

router.patch('/:id/stock', async (req, res) => {
  try {
    const { cantidad, tipo } = req.body
    
    let result
    if (tipo === 'entrada') {
      result = await query(`
        UPDATE productos 
        SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `, [cantidad, req.params.id])
    } else if (tipo === 'salida') {
      result = await query(`
        UPDATE productos 
        SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `, [cantidad, req.params.id])
    } else if (tipo === 'ajuste') {
      result = await query(`
        UPDATE productos 
        SET stock = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `, [cantidad, req.params.id])
    }
    
    const producto = result.rows[0]
    const cat = await query('SELECT nombre FROM categorias WHERE id = $1', [producto.categoria_id])
    producto.categoria_nombre = cat.rows[0]?.nombre || null
    
    res.json(producto)
  } catch (error) {
    res.status(500).json({ message: 'Error al ajustar stock', error: error.message })
  }
})

export default router