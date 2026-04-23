import { Router } from 'express'
import { query } from '../db.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM categorias WHERE negocio_id = $1 ORDER BY nombre',
      [req.negocioId]
    )
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener categorías', error: error.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { nombre } = req.body
    
    const existente = await query(
      'SELECT id FROM categorias WHERE nombre = $1 AND negocio_id = $2',
      [nombre, req.negocioId]
    )
    if (existente.rows.length > 0) {
      return res.status(400).json({ message: 'La categoría ya existe' })
    }
    
    const result = await query(
      'INSERT INTO categorias (negocio_id, nombre) VALUES ($1, $2) RETURNING *',
      [req.negocioId, nombre]
    )
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ message: 'Error al crear categoría', error: error.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { nombre } = req.body
    
    const result = await query(
      'UPDATE categorias SET nombre = $1 WHERE id = $2 AND negocio_id = $3 RETURNING *',
      [nombre, req.params.id, req.negocioId]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Categoría no encontrada' })
    }
    
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar categoría', error: error.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await query(
      'DELETE FROM categorias WHERE id = $1 AND negocio_id = $2',
      [req.params.id, req.negocioId]
    )
    res.json({ message: 'Categoría eliminada' })
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar categoría', error: error.message })
  }
})

export default router