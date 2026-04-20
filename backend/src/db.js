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
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol VARCHAR(50) DEFAULT 'usuario',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS categorias (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS productos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        codigo_barras VARCHAR(100),
        categoria_id INTEGER REFERENCES categorias(id),
        precio_compra DECIMAL(10, 2) DEFAULT 0,
        precio_venta DECIMAL(10, 2) DEFAULT 0,
        stock INTEGER DEFAULT 0,
        stock_minimo INTEGER DEFAULT 5,
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ventas (
        id SERIAL PRIMARY KEY,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      INSERT INTO categorias (nombre) 
      SELECT 'General' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nombre = 'General')
      UNION ALL SELECT 'Bebidas' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nombre = 'Bebidas')
      UNION ALL SELECT 'Alimentos' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nombre = 'Alimentos')
      UNION ALL SELECT 'Snacks' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nombre = 'Snacks')
      UNION ALL SELECT 'Dulces' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nombre = 'Dulces')
    `)
    console.log('Database initialized')
  } catch (error) {
    console.error('Error initializing database:', error)
  } finally {
    client.release()
  }
}