import { Router } from 'express'
import { query } from '../db.js'
import { authenticate } from '../middleware/auth.js'
import bcrypt from 'bcryptjs'
import validator from 'validator'

const router = Router()
router.use(authenticate)

const ROLES = ['admin', 'vendedor', 'usuario']

router.get('/', async (req, res) => {
  try {
    if (req.userRol !== 'admin') {
      return res.status(403).json({ message: 'Solo admins pueden ver usuarios' })
    }
    const result = await query(
      'SELECT id, nombre, email, rol, created_at FROM usuarios WHERE negocio_id = $1 ORDER BY nombre',
      [req.negocioId]
    )
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message })
  }
})

router.post('/', async (req, res) => {
  try {
    if (req.userRol !== 'admin') {
      return res.status(403).json({ message: 'Solo admins pueden crear usuarios' })
    }

    const { nombre, email, password, rol } = req.body

    if (!nombre || !validator.isLength(nombre, { min: 2, max: 255 })) {
      return res.status(400).json({ message: 'Nombre requerido (2-255 caracteres)' })
    }
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ message: 'Email inválido' })
    }
    if (!password || !validator.isLength(password, { min: 6, max: 100 })) {
      return res.status(400).json({ message: 'Password requerido (mínimo 6 caracteres)' })
    }
    if (!rol || !ROLES.includes(rol)) {
      return res.status(400).json({ message: 'Rol inválido. Roles válidos: ' + ROLES.join(', ') })
    }

    const existente = await query('SELECT id FROM usuarios WHERE email = $1', [email.toLowerCase().trim()])
    if (existente.rows.length > 0) {
      return res.status(400).json({ message: 'El correo ya está registrado' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const result = await query(
      'INSERT INTO usuarios (negocio_id, nombre, email, password, rol) VALUES ($1, $2, $3, $4, $5) RETURNING id, nombre, email, rol, created_at',
      [req.negocioId, nombre.trim(), email.toLowerCase().trim(), hashedPassword, rol]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'El correo ya está registrado' })
    }
    res.status(500).json({ message: 'Error al crear usuario', error: error.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    if (req.userRol !== 'admin' && req.userId !== parseInt(req.params.id)) {
      return res.status(403).json({ message: 'No tienes permiso para editar este usuario' })
    }

    const { nombre, email, password, rol } = req.body

    const usuario = await query('SELECT id, rol FROM usuarios WHERE id = $1 AND negocio_id = $2', [req.params.id, req.negocioId])
    if (usuario.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    if (req.userRol !== 'admin' && rol && rol !== usuario.rows[0].rol) {
      return res.status(403).json({ message: 'No puedes cambiar tu propio rol' })
    }

    if (nombre && !validator.isLength(nombre, { min: 2, max: 255 })) {
      return res.status(400).json({ message: 'Nombre inválido' })
    }
    if (email && !validator.isEmail(email)) {
      return res.status(400).json({ message: 'Email inválido' })
    }
    if (password && !validator.isLength(password, { min: 6, max: 100 })) {
      return res.status(400).json({ message: 'Password muy corto (mín 6 caracteres)' })
    }
    if (rol && !ROLES.includes(rol)) {
      return res.status(400).json({ message: 'Rol inválido' })
    }

    let hashedPassword
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12)
    }

    const result = await query(`
      UPDATE usuarios
      SET nombre = COALESCE($1, nombre),
          email = COALESCE($2, email),
          password = COALESCE($3, password),
          rol = COALESCE($4, rol)
      WHERE id = $5 AND negocio_id = $6
      RETURNING id, nombre, email, rol
    `, [nombre?.trim(), email?.toLowerCase().trim(), hashedPassword, rol, req.params.id, req.negocioId])

    res.json(result.rows[0])
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'El correo ya está registrado' })
    }
    res.status(500).json({ message: 'Error al actualizar usuario', error: error.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    if (req.userRol !== 'admin') {
      return res.status(403).json({ message: 'Solo admins pueden eliminar usuarios' })
    }
    if (parseInt(req.params.id) === req.userId) {
      return res.status(400).json({ message: 'No puedes eliminarte a ti mismo' })
    }

    const usuario = await query('SELECT id FROM usuarios WHERE id = $1 AND negocio_id = $2', [req.params.id, req.negocioId])
    if (usuario.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    await query('DELETE FROM usuarios WHERE id = $1', [req.params.id])
    res.json({ message: 'Usuario eliminado' })
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar usuario', error: error.message })
  }
})

export default router