import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { pool, initDB } from './db.js'
import authRoutes from './routes/auth.js'
import productosRoutes from './routes/productos.js'
import categoriasRoutes from './routes/categorias.js'
import ventasRoutes from './routes/ventas.js'
import configuracionesRoutes from './routes/configuraciones.js'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.use((req, res, next) => {
  req.pool = pool
  next()
})

app.get('/api', (req, res) => {
  res.json({ message: 'API POS', version: '1.0.0', status: 'OK' })
})

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'healthy', database: 'connected' })
  } catch (error) {
    res.json({ status: 'unhealthy', database: 'disconnected' })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/productos', productosRoutes)
app.use('/api/categorias', categoriasRoutes)
app.use('/api/ventas', ventasRoutes)
app.use('/api/configuraciones', configuracionesRoutes)

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Error interno', error: err.message })
})

app.listen(PORT, async () => {
  await initDB()
  console.log(`Server running on port ${PORT}`)
})