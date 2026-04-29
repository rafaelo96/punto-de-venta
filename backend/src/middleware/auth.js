import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

export const authenticate = async (req, res, next) => {
  // Check Authorization header first, then query parameter (for ticket printing)
  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '') || req.query.token
  
  if (!token) {
    return res.status(401).json({ message: 'No autorizado: Token ausente' })
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (!decoded.negocio_id || !decoded.id) {
      return res.status(401).json({ message: 'Token inválido: Falta información' })
    }
    req.negocioId = decoded.negocio_id
    req.userId = decoded.id
    req.userEmail = decoded.email
    req.userRol = decoded.rol || 'usuario'
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' })
    }
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
      req.userRol = decoded.rol || 'usuario'
    } catch (e) {
      // Ignore invalid token for optional auth
    }
  }
  next()
}

export const requireAdmin = (req, res, next) => {
  if (req.userRol !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado: se requiere rol admin' })
  }
  next()
}