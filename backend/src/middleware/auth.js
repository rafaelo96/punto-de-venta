import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'pos_secret_key_2024'

export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    return res.status(401).json({ message: 'No autorizado' })
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (!decoded.negocio_id) {
      return res.status(401).json({ message: 'Token inválido' })
    }
    req.negocioId = decoded.negocio_id
    req.userId = decoded.id
    next()
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' })
  }
}

export const optionalAuth = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      req.negocioId = decoded.negocio_id
      req.userId = decoded.id
    } catch (e) {
      // Ignore
    }
  }
  next()
}