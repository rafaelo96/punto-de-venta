import { Router } from 'express'
import { query } from '../db.js'
import { authenticate } from '../middleware/auth.js'
import { cacheMiddleware, invalidateCache } from '../utils/redis.js'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import validator from 'validator'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const router = Router()
router.use(authenticate)

const validateInt = (val) => validator.isInt(String(val), { min: 0 })
const validateFloat = (val) => validator.isFloat(String(val), { min: 0 })
const validateString = (val) => validator.isLength(val, { min: 1, max: 255 })
const validateOptionalString = (val) => !val || validator.isLength(val, { max: 100 })

const getStoragePath = (negocioId) => {
  const storageDir = path.join(__dirname, `../../uploads/${negocioId}/productos`)
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true })
  }
  return storageDir
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, getStoragePath(req.negocioId)),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const validExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    if (!validExts.includes(ext.toLowerCase())) {
      return cb(new Error('Extensión de imagen no válida'))
    }
    cb(null, `producto_${Date.now()}${ext}`)
  }
})

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Tipo de archivo no válido'), false)
  }
}

const uploadProducto = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 }, fileFilter })

router.post('/:id/imagen', uploadProducto.single('imagen'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se recibió imagen' })
    }
    const producto = await query('SELECT id, negocio_id FROM productos WHERE id = $1', [req.params.id])
    if (producto.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' })
    }
    if (producto.rows[0].negocio_id !== req.negocioId) {
      return res.status(403).json({ message: 'No tienes permiso para modificar este producto' })
    }
    const imagenPath = `/uploads/${req.negocioId}/productos/${req.file.filename}`
    const result = await query(`
      UPDATE productos SET imagen = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND negocio_id = $3
      RETURNING *
    `, [imagenPath, req.params.id, req.negocioId])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' })
    }
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ message: 'Error al subir imagen', error: error.message })
  }
})

router.get('/', cacheMiddleware(300), async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        p.id, p.nombre, p.codigo_barras, p.categoria_id, p.stock, p.stock_minimo,
        p.activo, p.imagen, p.precio_compra, p.precio_venta,
        c.nombre as categoria_nombre
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.negocio_id = $1 AND p.activo = true
      ORDER BY p.nombre
    `, [req.negocioId])
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos', error: error.message })
  }
})

router.put('/:id/imagen', async (req, res) => {
  try {
    const { imagen } = req.body
    if (!imagen || !validator.isURL(imagen, { protocols: ['http', 'https'], require_protocol: true })) {
      return res.status(400).json({ message: 'URL de imagen inválida' })
    }
    const producto = await query('SELECT id, negocio_id FROM productos WHERE id = $1', [req.params.id])
    if (producto.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' })
    }
    if (producto.rows[0].negocio_id !== req.negocioId) {
      return res.status(403).json({ message: 'No tienes permiso para modificar este producto' })
    }
    const result = await query(`
      UPDATE productos SET imagen = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND negocio_id = $3
      RETURNING *
    `, [imagen, req.params.id, req.negocioId])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' })
    }
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar imagen', error: error.message })
  }
})

router.get('/:id', cacheMiddleware(600), async (req, res) => {
  try {
    if (!validator.isInt(req.params.id)) {
      return res.status(400).json({ message: 'ID inválido' })
    }
    const result = await query(
      'SELECT * FROM productos WHERE id = $1 AND negocio_id = $2',
      [req.params.id, req.negocioId]
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

    if (!nombre || !validateString(nombre)) {
      return res.status(400).json({ message: 'Nombre inválido (1-255 caracteres requeridos)' })
    }
    if (codigo_barras && !validateOptionalString(codigo_barras)) {
      return res.status(400).json({ message: 'Código de barras muy largo (máx 100 caracteres)' })
    }
    if (categoria_id && !validator.isInt(String(categoria_id), { min: 1 })) {
      return res.status(400).json({ message: 'ID de categoría inválido' })
    }
    if (!validateFloat(precio_compra)) {
      return res.status(400).json({ message: 'Precio de compra inválido' })
    }
    if (!validateFloat(precio_venta)) {
      return res.status(400).json({ message: 'Precio de venta inválido' })
    }
    if (stock !== undefined && !validateInt(stock)) {
      return res.status(400).json({ message: 'Stock inválido' })
    }
    if (stock_minimo !== undefined && !validateInt(stock_minimo)) {
      return res.status(400).json({ message: 'Stock mínimo inválido' })
    }

    if (parseFloat(precio_venta) < parseFloat(precio_compra)) {
      return res.status(400).json({ message: 'El precio de venta no puede ser menor al de compra' })
    }

    if (categoria_id) {
      const cat = await query('SELECT id FROM categorias WHERE id = $1 AND negocio_id = $2', [categoria_id, req.negocioId])
      if (cat.rows.length === 0) {
        return res.status(400).json({ message: 'Categoría no válida' })
      }
    }

    const result = await query(`
      INSERT INTO productos (negocio_id, nombre, codigo_barras, categoria_id, precio_compra, precio_venta, stock, stock_minimo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [req.negocioId, nombre.trim(), codigo_barras?.trim() || null, categoria_id || null, precio_compra, precio_venta, stock || 0, stock_minimo || 5])

    // Invalidate products cache
    await invalidateCache(`api:/api/productos*`)
    
    res.json(result.rows[0])
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'El código de barras ya existe' })
    }
    res.status(500).json({ message: 'Error al crear producto', error: error.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    if (!validator.isInt(req.params.id)) {
      return res.status(400).json({ message: 'ID inválido' })
    }

    const { nombre, codigo_barras, categoria_id, precio_compra, precio_venta, stock, stock_minimo, activo, imagen } = req.body

    const existe = await query('SELECT id FROM productos WHERE id = $1 AND negocio_id = $2', [req.params.id, req.negocioId])
    if (existe.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' })
    }

    if (nombre !== undefined && !validateString(nombre)) {
      return res.status(400).json({ message: 'Nombre inválido' })
    }
    if (codigo_barras !== undefined && !validateOptionalString(codigo_barras)) {
      return res.status(400).json({ message: 'Código de barras muy largo' })
    }
    if (categoria_id !== undefined && !validator.isInt(String(categoria_id), { min: 1 })) {
      return res.status(400).json({ message: 'ID de categoría inválido' })
    }
    if (precio_compra !== undefined && !validateFloat(precio_compra)) {
      return res.status(400).json({ message: 'Precio de compra inválido' })
    }
    if (precio_venta !== undefined && !validateFloat(precio_venta)) {
      return res.status(400).json({ message: 'Precio de venta inválido' })
    }
    if (stock !== undefined && !validateInt(stock)) {
      return res.status(400).json({ message: 'Stock inválido' })
    }
    if (stock_minimo !== undefined && !validateInt(stock_minimo)) {
      return res.status(400).json({ message: 'Stock mínimo inválido' })
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
          imagen = COALESCE($9, imagen),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $10 AND negocio_id = $11
      RETURNING *
    `, [nombre?.trim(), codigo_barras?.trim() || null, categoria_id || null, precio_compra, precio_venta, stock, stock_minimo, activo, imagen, req.params.id, req.negocioId])

    // Invalidate cache
    await invalidateCache(`api:/api/productos*`)
    
    res.json(result.rows[0])
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'El código de barras ya existe' })
    }
    res.status(500).json({ message: 'Error al actualizar producto', error: error.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    if (!validator.isInt(req.params.id)) {
      return res.status(400).json({ message: 'ID inválido' })
    }
    const result = await query(
      'UPDATE productos SET activo = false WHERE id = $1 AND negocio_id = $2',
      [req.params.id, req.negocioId]
    )
    // Invalidar cache
    await invalidateCache(`api:/api/productos*`)
    res.json({ message: 'Producto eliminado' })
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar producto', error: error.message })
  }
})

router.patch('/:id/stock', async (req, res) => {
  try {
    if (!validator.isInt(req.params.id)) {
      return res.status(400).json({ message: 'ID inválido' })
    }
    const { cantidad, tipo } = req.body

    if (!validator.isInt(String(cantidad), { min: 1 })) {
      return res.status(400).json({ message: 'Cantidad debe ser un número positivo' })
    }
    if (!['entrada', 'salida', 'ajuste'].includes(tipo)) {
      return res.status(400).json({ message: 'Tipo debe ser: entrada, salida o ajuste' })
    }

    const producto = await query('SELECT id, stock FROM productos WHERE id = $1 AND negocio_id = $2', [req.params.id, req.negocioId])
    if (producto.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' })
    }

    let newStock
    if (tipo === 'entrada') {
      newStock = producto.rows[0].stock + cantidad
    } else if (tipo === 'salida') {
      newStock = producto.rows[0].stock - cantidad
      if (newStock < 0) {
        return res.status(400).json({ message: 'No hay suficiente stock', stock_actual: producto.rows[0].stock })
      }
    } else {
      newStock = cantidad
    }

    const result = await query(`
      UPDATE productos
      SET stock = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND negocio_id = $3
      RETURNING *
    `, [newStock, req.params.id, req.negocioId])

    // Invalidar cache
    await invalidateCache(`api:/api/productos*`)
    
    const cat = await query('SELECT nombre FROM categorias WHERE id = $1', [result.rows[0].categoria_id])
    
    res.json({ ...result.rows[0], categoria_nombre: cat.rows[0]?.nombre })
  } catch (error) {
    res.status(500).json({ message: 'Error al ajustar stock', error: error.message })
  }
})

export default router