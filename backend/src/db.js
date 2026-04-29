import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'pos',
  password: process.env.DB_PASSWORD || 'pos',
  database: process.env.DB_NAME || 'punto_venta',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
})

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
    if (parseInt(existingNegocio.rows[0].count) === 0) {
      const result = await client.query(`
        INSERT INTO negocios (nombre, slug, color_principal) 
        VALUES ('NutriStore', 'nutristore', '#3b82f6')
        RETURNING id
      `)
      const negocioId = result.rows[0].id

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

      await client.query(`
        INSERT INTO productos (negocio_id, nombre, codigo_barras, categoria_id, precio_compra, precio_venta, stock, stock_minimo, activo) VALUES
        ($1, 'Whey Protein Chocolate', '7503095230011', $2, 350.00, 499.00, 15, 5, true),
        ($1, 'Whey Protein Vainilla', '7503095230028', $3, 350.00, 499.00, 12, 5, true),
        ($1, 'Creatina Monohidrato', '7503095230035', $4, 180.00, 299.00, 20, 8, true),
        ($1, 'BCAA Energy', '7503095230042', $5, 220.00, 349.00, 10, 5, true),
        ($1, 'Vitamina D3 5000 UI', '7503095230059', $6, 85.00, 159.00, 25, 10, true),
        ($1, 'Vitamina C 1000mg', '7503095230066', $7, 65.00, 129.00, 30, 10, true),
        ($1, 'Multivitamínico Adulto', '7503095230073', $8, 120.00, 219.00, 18, 8, true),
        ($1, 'Batido Proteína Vainilla', '7503095230080', $9, 180.00, 299.00, 8, 3, true),
        ($1, 'Batido Proteína Chocolate', '7503095230097', $9, 180.00, 299.00, 8, 3, true),
        ($1, 'Barra Proteína Cookies', '7503095230103', $10, 45.00, 79.00, 20, 10, true),
        ($1, 'Barra Proteína Chocolate', '7503095230110', $10, 45.00, 79.00, 20, 10, true),
        ($1, 'Almendra Cruda 250g', '7503095230127', $11, 85.00, 149.00, 15, 5, true),
        ($1, 'Mix Nuts Original', '7503095230134', $11, 95.00, 169.00, 12, 5, true),
        ($1, 'Té Verde Matcha', '7503095230141', $12, 150.00, 249.00, 10, 4, true),
        ($1, 'Té Detox Limón', '7503095230158', $12, 65.00, 119.00, 15, 5, true),
        ($1, 'Miel de Abeja 500g', '7503095230165', $13, 120.00, 199.00, 8, 3, true),
        ($1, 'Stevia Líquida', '7503095230172', $13, 55.00, 99.00, 20, 8, true),
        ($1, 'Aceite de Oliva Extra Virgin', '7503095230189', $14, 180.00, 299.00, 10, 4, true),
        ($1, 'Aceite de Coco', '7503095230196', $14, 145.00, 249.00, 8, 4, true)
      `, [
        negocioId, 
        catMap['Proteínas'], catMap['Proteínas'], catMap['Suplementos'], catMap['Suplementos'],
        catMap['Vitaminas'], catMap['Vitaminas'], catMap['Vitaminas'],
        catMap['Batidos'], catMap['Batidos'],
        catMap['Snacks Saludables'], catMap['Snacks Saludables'],
        catMap['Frutos Secos'], catMap['Frutos Secos'],
        catMap['Tés e Infusiones'], catMap['Tés e Infusiones'],
        catMap['Miel y Endulzantes'], catMap['Miel y Endulzantes'],
        catMap['Aceites'], catMap['Aceites']
      ])
    }
    console.log('Database initialized')
  } catch (error) {
    console.error('Error initializing database:', error)
  } finally {
    client.release()
  }
}