import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { pool, initDB } from './db.js'
import { initRedis } from './utils/redis.js'
import authRoutes from './routes/auth.js'
import productosRoutes from './routes/productos.js'
import categoriasRoutes from './routes/categorias.js'
import ventasRoutes from './routes/ventas.js'
import configuracionesRoutes from './routes/configuraciones.js'
import usuariosRoutes from './routes/usuarios.js'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: 'cross-origin'
}))

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { message: 'Demasiadas solicitudes, intenta más tarde' },
  standardHeaders: true,
  legacyHeaders: false
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Demasiados intentos de login, intenta más tarde' },
  standardHeaders: true,
  legacyHeaders: false
})

app.use('/api', generalLimiter)
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*')
    res.set('Cross-Origin-Resource-Policy', 'cross-origin')
  }
}))

app.use((req, res, next) => {
  req.pool = pool
  req.startTime = Date.now()
  const originalJson = res.json.bind(res)
  res.json = (body) => {
    const duration = Date.now() - req.startTime
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`)
    return originalJson(body)
  }
  next()
})

app.get('/api', (req, res) => {
  res.json({ message: 'API POS', version: '1.1.0', status: 'OK' })
})

app.get('/api/health', async (req, res) => {
  try {
    const start = Date.now()
    await pool.query('SELECT 1')
    const dbLatency = Date.now() - start
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      db_latency_ms: dbLatency,
      memory: process.memoryUsage()
    })
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
      error: error.message
    })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/productos', productosRoutes)
app.use('/api/categorias', categoriasRoutes)
app.use('/api/ventas', ventasRoutes)
app.use('/api/configuraciones', configuracionesRoutes)
app.use('/api/usuarios', usuariosRoutes)

app.use((err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()} ${req.method} ${req.path}:`, err)

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'Archivo muy grande (máx 2MB)' })
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ message: 'Campo de archivo inesperado' })
  }
  if (err.message && err.message.includes('Extensión de imagen')) {
    return res.status(400).json({ message: err.message })
  }

  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor'
  })
})

process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor gracefully...')
  pool.end().then(() => {
    console.log('Pool de conexiones cerrado')
    process.exit(0)
  })
})

app.listen(PORT, async () => {
  await initDB()
  
  // Initialize Redis (optional - will continue without if fails)
  try {
    await initRedis()
  } catch (err) {
    console.warn('Redis not available - running without cache')
  }
  
  console.log(`Server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})