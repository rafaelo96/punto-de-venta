import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query } from '../db.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'pos_secret_key_2024'

const generateSlug = (nombre) => {
  return nombre.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}

router.post('/register', async (req, res) => {
  try {
    const { nombre, email, password, nombreNegocio } = req.body
    
    const existente = await query('SELECT id FROM usuarios WHERE email = $1', [email])
    if (existente.rows.length > 0) {
      return res.status(400).json({ message: 'El correo ya está registrado' })
    }

    const slug = generateSlug(nombreNegocio || nombre)
    const slugExistente = await query('SELECT id FROM negocios WHERE slug = $1', [slug])
    const finalSlug = slugExistente.rows.length > 0 ? `${slug}_${Date.now()}` : slug

    const resultNegocio = await query(
      'INSERT INTO negocios (nombre, slug) VALUES ($1, $2) RETURNING id, nombre, slug, color_principal',
      [nombreNegocio || nombre, finalSlug]
    )
    const negocio = resultNegocio.rows[0]

    await query(
      'INSERT INTO configuraciones (negocio_id, clave, valor) VALUES ($1, $2, $3), ($1, $4, $5), ($1, $6, $7)',
      [negocio.id, 'emitir_ticket', 'true', 'sonido', 'true', 'mostrar_stock', 'true']
    )

    const hashedPassword = await bcrypt.hash(password, 10)
    
    const result = await query(
      'INSERT INTO usuarios (negocio_id, nombre, email, password, rol) VALUES ($1, $2, $3, $4, $5) RETURNING id, nombre, email, rol',
      [negocio.id, nombre, email, hashedPassword, 'admin']
    )
    
    const user = result.rows[0]
    const token = jwt.sign({ 
      id: user.id, 
      email: user.email,
      negocio_id: negocio.id 
    }, JWT_SECRET, { expiresIn: '7d' })
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        nombre: user.nombre, 
        email: user.email, 
        rol: user.rol,
        negocio: {
          id: negocio.id,
          nombre: negocio.nombre,
          slug: negocio.slug,
          color_principal: negocio.color_principal
        }
      } 
    })
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
    
    const negocioResult = await query('SELECT * FROM negocios WHERE id = $1', [user.negocio_id])
    const negocio = negocioResult.rows[0]
    
    const token = jwt.sign({ 
      id: user.id, 
      email: user.email,
      negocio_id: user.negocio_id 
    }, JWT_SECRET, { expiresIn: '7d' })
    
    res.json({
      token,
      user: { 
        id: user.id, 
        nombre: user.nombre, 
        email: user.email, 
        rol: user.rol,
        negocio: {
          id: negocio.id,
          nombre: negocio.nombre,
          slug: negocio.slug,
          color_principal: negocio.color_principal,
          logo: negocio.logo
        }
      }
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
    const result = await query('SELECT id, nombre, email, rol, negocio_id FROM usuarios WHERE id = $1', [decoded.id])
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado' })
    }
    
    const user = result.rows[0]
    const negocioResult = await query('SELECT id, nombre, slug, logo, color_principal FROM negocios WHERE id = $1', [user.negocio_id])
    const negocio = negocioResult.rows[0]
    
    res.json({ 
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        negocio: {
          id: negocio.id,
          nombre: negocio.nombre,
          slug: negocio.slug,
          color_principal: negocio.color_principal,
          logo: negocio.logo
        }
      }
    })
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' })
  }
})

export default router