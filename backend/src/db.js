import pg from 'pg'
import dotenv from 'dotenv'
import { promises as dns } from 'dns'

dotenv.config({ path: process.env.NODE_ENV === 'production' ? undefined : '.env' })

console.log('=== INICIANDO DB ===')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('DATABASE_URL presente:', !!process.env.DATABASE_URL)

// Resolver hostname a IPv4
async function resolveToIPv4(hostname) {
  try {
    const addresses = await dns.resolve4(hostname)
    console.log('IPs IPv4 resueltas:', addresses)
    return addresses[0]  // Devuelve la primera IPv4
  } catch (err) {
    console.log('Error resolviendo IPv4:', err.message)
    return null
  }
}

const { Pool } = pg

// Parser simple para connection string
function parseConnectionString(url) {
  console.log('Parseando URL:', url.substring(0, 50) + '...')
  const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)
  if (!match) {
    console.log('ERROR: No se pudo parsear la URL')
    return null
  }
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4]),
    database: match[5]
  }
}

// Soportar DATABASE_URL directamente o variables separadas
let poolConfig = {}

if (process.env.DATABASE_URL) {
  console.log('Usando DATABASE_URL...')
  const parsed = parseConnectionString(process.env.DATABASE_URL)
  if (parsed) {
    const hostToUse = process.env.DB_HOST_IP || parsed.host
    poolConfig = {
      host: hostToUse,
      port: parsed.port,
      user: parsed.user,
      password: parsed.password,
      database: parsed.database,
      ssl: { rejectUnauthorized: false, require: true }
    }
    console.log('Host a conectar:', hostToUse)
  }
} else if (process.env.DB_HOST) {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.DB_PORT === '6543'
  console.log('Usando variables separadas (producción:', isProduction, ')...')
  poolConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'postgres',
    ssl: isProduction ? { rejectUnauthorized: false, require: true } : false
  }
  console.log('Host:', process.env.DB_HOST)
} else {
  console.log('ERROR: No hay DATABASE_URL ni DB_HOST')
  process.exit(1)
}

export const pool = new Pool({
  ...poolConfig,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000
})

// Test de conexión inicial
pool.on('connect', () => {
  console.log('✓ Conexión a PostgreSQL establecida')
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
})

// Probar conexión al inicio
pool.query('SELECT 1')
  .then(() => console.log('✓ Query de prueba exitosa'))
  .catch(err => console.error('✗ Error en query de prueba:', err.message))

export const query = (text, params) => pool.query(text, params)

export const initDB = async () => {
  const client = await pool.connect()
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS negocios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        logo TEXT,
        color_principal VARCHAR(20) DEFAULT '#3b82f6',
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        negocio_id INTEGER REFERENCES negocios(id) ON DELETE CASCADE,
        nombre VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol VARCHAR(50) DEFAULT 'usuario',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS categorias (
        id SERIAL PRIMARY KEY,
        negocio_id INTEGER REFERENCES negocios(id) ON DELETE CASCADE,
        nombre VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

CREATE TABLE IF NOT EXISTS productos (
        id SERIAL PRIMARY KEY,
        negocio_id INTEGER REFERENCES negocios(id) ON DELETE CASCADE,
        nombre VARCHAR(255) NOT NULL,
        codigo_barras VARCHAR(100),
        categoria_id INTEGER REFERENCES categorias(id),
        precio_compra DECIMAL(10, 2) DEFAULT 0,
        precio_venta DECIMAL(10, 2) DEFAULT 0,
        descuento_porcentaje DECIMAL(5, 2) DEFAULT 0,
        stock INTEGER DEFAULT 0,
        stock_minimo INTEGER DEFAULT 5,
        imagen TEXT,
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ventas (
        id SERIAL PRIMARY KEY,
        negocio_id INTEGER REFERENCES negocios(id) ON DELETE CASCADE,
        usuario_id INTEGER REFERENCES usuarios(id),
        folio VARCHAR(50) UNIQUE,
        total DECIMAL(10, 2) DEFAULT 0,
        descuento_porcentaje DECIMAL(5, 2) DEFAULT 0,
        metodo_pago VARCHAR(50) DEFAULT 'efectivo',
        efectivo DECIMAL(10, 2) DEFAULT 0,
        cambio DECIMAL(10, 2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'completada',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

CREATE TABLE IF NOT EXISTS ventas_items (
  id SERIAL PRIMARY KEY,
  venta_id INTEGER REFERENCES ventas(id) ON DELETE CASCADE,
  producto_id INTEGER REFERENCES productos(id),
  cantidad INTEGER NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  descuento_porcentaje DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Migración: agregar columna descuento_porcentaje si no existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ventas_items' AND column_name='descuento_porcentaje') THEN
    ALTER TABLE ventas_items ADD COLUMN descuento_porcentaje DECIMAL(5, 2) DEFAULT 0;
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS configuraciones (
  id SERIAL PRIMARY KEY,
  negocio_id INTEGER REFERENCES negocios(id) ON DELETE CASCADE,
  clave VARCHAR(100) NOT NULL,
  valor TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(negocio_id, clave)
);

CREATE TABLE IF NOT EXISTS ventas_canceladas (
  id SERIAL PRIMARY KEY,
  venta_original_id INTEGER NOT NULL,
  negocio_id INTEGER REFERENCES negocios(id) ON DELETE CASCADE,
  usuario_id INTEGER REFERENCES usuarios(id),
  motivo TEXT,
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='imagen') THEN
    ALTER TABLE productos ADD COLUMN imagen TEXT;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_productos_negocio ON productos(negocio_id);
CREATE INDEX IF NOT EXISTS idx_productos_codigo_barras ON productos(codigo_barras);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);
CREATE INDEX IF NOT EXISTS idx_ventas_negocio ON ventas(negocio_id);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(created_at);
CREATE INDEX IF NOT EXISTS idx_ventas_status ON ventas(status);
CREATE INDEX IF NOT EXISTS idx_categorias_negocio ON categorias(negocio_id);
CREATE INDEX IF NOT EXISTS idx_ventas_items_venta ON ventas_items(venta_id);
`)

     const existingNegocio = await client.query('SELECT COUNT(*) FROM negocios')
     let negocioId = null
     if (parseInt(existingNegocio.rows[0].count) === 0) {
       const result = await client.query(`
         INSERT INTO negocios (nombre, slug, color_principal) 
         VALUES ('NutriStore', 'nutristore', '#3b82f6')
         RETURNING id
       `)
       negocioId = result.rows[0].id

       await client.query(`
         INSERT INTO configuraciones (negocio_id, clave, valor) VALUES
         ($1, 'emitir_ticket', 'true'),
         ($1, 'sonido', 'true'),
         ($1, 'mostrar_stock', 'true'),
         ($1, 'nombre_negocio', 'NutriStore'),
         ($1, 'direccion_negocio', ''),
         ($1, 'telefono_negocio', '')
       `, [negocioId])

       const catResult = await client.query(`
         INSERT INTO categorias (negocio_id, nombre) VALUES
         ($1, 'Suplementos'),
         ($1, 'Vitaminas'),
         ($1, 'Proteínas'),
         ($1, 'Batidos'),
         ($1, 'Snacks Saludables'),
         ($1, 'Frutos Secos'),
         ($1, 'Tés e Infusiones'),
         ($1, 'Miel y Endulzantes'),
         ($1, 'Aceites')
         RETURNING id, nombre
       `, [negocioId])

const catMap = {}
        catResult.rows.forEach(c => { catMap[c.nombre] = c.id })

        const productos = [
          ['Whey Protein Chocolate', '7503095230011', 'Proteínas', 350.00, 499.00, 15],
          ['Whey Protein Vainilla', '7503095230028', 'Proteínas', 350.00, 499.00, 12],
          ['Creatina Monohidrato', '7503095230035', 'Suplementos', 180.00, 299.00, 20],
          ['BCAA Energy', '7503095230042', 'Suplementos', 220.00, 349.00, 10],
          ['Vitamina D3 5000 UI', '7503095230059', 'Vitaminas', 85.00, 159.00, 25],
          ['Vitamina C 1000mg', '7503095230066', 'Vitaminas', 65.00, 129.00, 30],
          ['Multivitamínico Adulto', '7503095230073', 'Vitaminas', 120.00, 219.00, 18],
          ['Batido Proteína Vainilla', '7503095230080', 'Batidos', 180.00, 299.00, 8],
          ['Batido Proteína Chocolate', '7503095230097', 'Batidos', 180.00, 299.00, 8],
          ['Barra Proteína Cookies', '7503095230103', 'Snacks Saludables', 45.00, 79.00, 20],
          ['Barra Proteína Chocolate', '7503095230110', 'Snacks Saludables', 45.00, 79.00, 20],
          ['Almendra Cruda 250g', '7503095230127', 'Frutos Secos', 85.00, 149.00, 15],
          ['Mix Nuts Original', '7503095230134', 'Frutos Secos', 95.00, 169.00, 12],
          ['Té Verde Matcha', '7503095230141', 'Tés e Infusiones', 150.00, 249.00, 10],
          ['Té Detox Limón', '7503095230158', 'Tés e Infusiones', 65.00, 119.00, 15],
          ['Miel de Abeja 500g', '7503095230165', 'Miel y Endulzantes', 120.00, 199.00, 8],
          ['Stevia Líquida', '7503095230172', 'Miel y Endulzantes', 55.00, 99.00, 20],
          ['Aceite de Oliva Extra Virgin', '7503095230189', 'Aceites', 180.00, 299.00, 10],
          ['Aceite de Coco', '7503095230196', 'Aceites', 145.00, 249.00, 8]
        ]

        for (const p of productos) {
          await client.query(`
            INSERT INTO productos (negocio_id, nombre, codigo_barras, categoria_id, precio_compra, precio_venta, stock, stock_minimo, activo)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 5, true)
          `, [negocioId, p[0], p[1], catMap[p[2]], p[3], p[4], p[5]])
        }
         } else {
       // Get existing business ID for admin user creation
       const negocioResult = await client.query('SELECT id FROM negocios LIMIT 1')
       negocioId = negocioResult.rows[0].id
     }

     // Create initial admin user if no users exist
     const existingUsers = await client.query('SELECT COUNT(*) FROM usuarios')
     if (parseInt(existingUsers.rows[0].count) === 0) {
       const bcrypt = await import('bcryptjs')
       const hashedPassword = await bcrypt.default.hash('admin123', 12)
       await client.query(`
         INSERT INTO usuarios (negocio_id, nombre, email, password, rol) 
         VALUES ($1, 'Administrador', 'admin@admin.com', $2, 'administrador')
       `, [negocioId, hashedPassword])
       console.log('Created initial admin user')
      }
     console.log('Database initialized')
  } catch (error) {
    console.error('Error initializing database:', error)
  } finally {
    client.release()
  }
}