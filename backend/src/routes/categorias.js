import { Router } from 'express'
import { query } from '../db.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM categorias ORDER BY nombre'
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
      'SELECT id FROM categorias WHERE nombre = $1',
      [nombre]
    )
    if (existente.rows.length > 0) {
      return res.status(400).json({ message: 'La categoría ya existe' })
    }
    
    const result = await query(
      'INSERT INTO categorias (nombre) VALUES ($1) RETURNING *',
      [nombre]
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
      'UPDATE categorias SET nombre = $1 WHERE id = $2 RETURNING *',
      [nombre, req.params.id]
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
      'DELETE FROM categorias WHERE id = $1',
      [req.params.id]
    )
    res.json({ message: 'Categoría eliminada' })
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar categoría', error: error.message })
  }
})

router.use((req, res, next) => {
  if (req.method !== 'GET') {
    return res.status(401).json({ message: 'No autorizado' })
  }
  next()
})

export default router