import { Router } from 'express'
import { query } from '../db.js'
import { authenticate } from '../middleware/auth.js'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const router = Router()

router.use(authenticate)

const getStoragePath = (negocioId) => {
  const storageDir = path.join(__dirname, `../../uploads/${negocioId}`)
  console.log('Storage path:', storageDir)
  if (!fs.existsSync(storageDir)) {
    console.log('Creating directory:', storageDir)
    fs.mkdirSync(storageDir, { recursive: true })
  }
  return storageDir
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, getStoragePath(req.negocioId)),
  filename: (req, file, cb) => cb(null, `logo${path.extname(file.originalname)}`)
})

const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } })

router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT clave, valor FROM configuraciones WHERE negocio_id = $1',
      [req.negocioId]
    )
    const configs = {}
    result.rows.forEach(row => {
      configs[row.clave] = row.valor
    })
    
    const negocioResult = await query(
      'SELECT nombre, slug, logo, color_principal FROM negocios WHERE id = $1',
      [req.negocioId]
    )
    if (negocioResult.rows.length > 0) {
      configs.nombre_negocio = negocioResult.rows[0].nombre
      configs.slug_negocio = negocioResult.rows[0].slug
      configs.logo_negocio = negocioResult.rows[0].logo
      configs.color_principal = negocioResult.rows[0].color_principal
    }
    
    res.json(configs)
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener configuraciones', error: error.message })
  }
})

router.put('/', async (req, res) => {
  try {
    const configs = req.body
    
    if (configs.nombre_negocio) {
      await query(
        'UPDATE negocios SET nombre = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [configs.nombre_negocio, req.negocioId]
      )
    }
    
    if (configs.color_principal) {
      await query(
        'UPDATE negocios SET color_principal = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [configs.color_principal, req.negocioId]
      )
    }
    
    const configKeys = ['emitir_ticket', 'sonido', 'mostrar_stock', 'direccion_negocio', 'telefono_negocio', 'vista']
    for (const clave of configKeys) {
      if (configs[clave] !== undefined) {
        await query(
          `INSERT INTO configuraciones (negocio_id, clave, valor) VALUES ($1, $2, $3)
           ON CONFLICT (negocio_id, clave) DO UPDATE SET valor = $3, updated_at = CURRENT_TIMESTAMP`,
          [req.negocioId, clave, String(configs[clave])]
        )
      }
    }
    
    res.json({ message: 'Configuraciones actualizadas' })
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar configuraciones', error: error.message })
  }
})

router.post('/logo', upload.single('logo'), async (req, res) => {
  try {
    console.log('=== Upload logo endpoint called ===')
    console.log('Body:', req.body)
    console.log('File:', req.file)
    console.log('NegocioId from middleware:', req.negocioId)
    
    if (!req.file) {
      console.log('No file received')
      return res.status(400).json({ message: 'No se recibió archivo' })
    }
    
    const logoPath = `/uploads/${req.negocioId}/logo${path.extname(req.file.originalname)}`
    console.log('Logo path to save:', logoPath)
    
    await query(
      'UPDATE negocios SET logo = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [logoPath, req.negocioId]
    )
    
    console.log('Logo saved to DB')
    res.json({ message: 'Logo actualizado', path: logoPath })
  } catch (error) {
    console.error('Error uploading logo:', error)
    res.status(500).json({ message: 'Error al subir logo', error: error.message })
  }
})

router.get('/negocio', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, nombre, slug, logo, color_principal, activo, created_at FROM negocios WHERE id = $1',
      [req.negocioId]
    )
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener negocio', error: error.message })
  }
})

export default router