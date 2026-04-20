import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query } from '../db.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'pos_secret_key_2024'

router.post('/register', async (req, res) => {
  try {
    const { nombre, email, password } = req.body
    
    const existente = await query('SELECT id FROM usuarios WHERE email = $1', [email])
    if (existente.rows.length > 0) {
      return res.status(400).json({ message: 'El correo ya está registrado' })
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const result = await query(
      'INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id, nombre, email, rol',
      [nombre, email, hashedPassword]
    )
    
    const user = result.rows[0]
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
    
    res.json({ token, user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } })
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar usuario', error: error.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    const result = await query('SELECT * FROM usuarios WHERE email = $1', [email])
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales incorrectas' })
    }
    
    const user = result.rows[0]
    const validPassword = await bcrypt.compare(password, user.password)
    
    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciales incorrectas' })
    }
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
    
    res.json({
      token,
      user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol }
    })
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión', error: error.message })
  }
})

router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ message: 'No autorizado' })
    }
    
    const decoded = jwt.verify(token, JWT_SECRET)
    const result = await query('SELECT id, nombre, email, rol FROM usuarios WHERE id = $1', [decoded.id])
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado' })
    }
    
    res.json({ user: result.rows[0] })
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' })
  }
})

export default router