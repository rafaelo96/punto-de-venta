exports.up = async (pgm) => {
  // Create negocios table
  pgm.createTable('negocios', {
    id: { type: 'serial', primaryKey: true },
    nombre: { type: 'varchar(255)', notNull: true },
    slug: { type: 'varchar(100)', notNull: true, unique: true },
    logo: { type: 'text' },
    color_principal: { type: 'varchar(20)', default: '#3b82f6' },
    activo: { type: 'boolean', default: true },
    created_at: { type: 'timestamp', default: pgm.func('CURRENT_TIMESTAMP') }
  });

  // Create usuarios table
  pgm.createTable('usuarios', {
    id: { type: 'serial', primaryKey: true },
    negocio_id: { type: 'integer', references: 'negocios(id)', onDelete: 'CASCADE' },
    nombre: { type: 'varchar(255)', notNull: true },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    password: { type: 'varchar(255)', notNull: true },
    rol: { type: 'varchar(50)', default: 'usuario' },
    created_at: { type: 'timestamp', default: pgm.func('CURRENT_TIMESTAMP') }
  });

  // Create categorias table
  pgm.createTable('categorias', {
    id: { type: 'serial', primaryKey: true },
    negocio_id: { type: 'integer', references: 'negocios(id)', onDelete: 'CASCADE' },
    nombre: { type: 'varchar(255)', notNull: true },
    created_at: { type: 'timestamp', default: pgm.func('CURRENT_TIMESTAMP') }
  });

  // Create productos table
  pgm.createTable('productos', {
    id: { type: 'serial', primaryKey: true },
    negocio_id: { type: 'integer', references: 'negocios(id)', onDelete: 'CASCADE' },
    nombre: { type: 'varchar(255)', notNull: true },
    codigo_barras: { type: 'varchar(100)' },
    categoria_id: { type: 'integer', references: 'categorias(id)' },
    precio_compra: { type: 'decimal(10,2)', default: 0 },
    precio_venta: { type: 'decimal(10,2)', default: 0 },
    descuento_porcentaje: { type: 'decimal(5,2)', default: 0 },
    stock: { type: 'integer', default: 0 },
    stock_minimo: { type: 'integer', default: 5 },
    imagen: { type: 'text' },
    activo: { type: 'boolean', default: true },
    created_at: { type: 'timestamp', default: pgm.func('CURRENT_TIMESTAMP') },
    updated_at: { type: 'timestamp', default: pgm.func('CURRENT_TIMESTAMP') }
  });

  // Create ventas table
  pgm.createTable('ventas', {
    id: { type: 'serial', primaryKey: true },
    negocio_id: { type: 'integer', references: 'negocios(id)', onDelete: 'CASCADE' },
    usuario_id: { type: 'integer', references: 'usuarios(id)' },
    folio: { type: 'varchar(50)', unique: true },
    total: { type: 'decimal(10,2)', default: 0 },
    descuento_porcentaje: { type: 'decimal(5,2)', default: 0 },
    metodo_pago: { type: 'varchar(50)', default: 'efectivo' },
    efectivo: { type: 'decimal(10,2)', default: 0 },
    cambio: { type: 'decimal(10,2)', default: 0 },
    status: { type: 'varchar(50)', default: 'completada' },
    created_at: { type: 'timestamp', default: pgm.func('CURRENT_TIMESTAMP') }
  });

  // Create ventas_items table
  pgm.createTable('ventas_items', {
    id: { type: 'serial', primaryKey: true },
    venta_id: { type: 'integer', references: 'ventas(id)', onDelete: 'CASCADE' },
    producto_id: { type: 'integer', references: 'productos(id)' },
    cantidad: { type: 'integer', notNull: true },
    precio_unitario: { type: 'decimal(10,2)', notNull: true },
    descuento_porcentaje: { type: 'decimal(5,2)', default: 0 },
    created_at: { type: 'timestamp', default: pgm.func('CURRENT_TIMESTAMP') }
  });

  // Create configuraciones table
  pgm.createTable('configuraciones', {
    id: { type: 'serial', primaryKey: true },
    negocio_id: { type: 'integer', references: 'negocios(id)', onDelete: 'CASCADE' },
    clave: { type: 'varchar(100)', notNull: true },
    valor: { type: 'text', notNull: true },
    updated_at: { type: 'timestamp', default: pgm.func('CURRENT_TIMESTAMP') }
  });

  // Create ventas_canceladas table
  pgm.createTable('ventas_canceladas', {
    id: { type: 'serial', primaryKey: true },
    venta_original_id: { type: 'integer', notNull: true },
    negocio_id: { type: 'integer', references: 'negocios(id)', onDelete: 'CASCADE' },
    usuario_id: { type: 'integer', references: 'usuarios(id)' },
    motivo: { type: 'text' },
    total: { type: 'decimal(10,2)', notNull: true },
    created_at: { type: 'timestamp', default: pgm.func('CURRENT_TIMESTAMP') }
  });

  // Create indexes
  pgm.createIndex('productos', 'negocio_id', { name: 'idx_productos_negocio' });
  pgm.createIndex('productos', 'codigo_barras', { name: 'idx_productos_codigo_barras' });
  pgm.createIndex('productos', 'activo', { name: 'idx_productos_activo' });
  pgm.createIndex('ventas', 'negocio_id', { name: 'idx_ventas_negocio' });
  pgm.createIndex('ventas', 'created_at', { name: 'idx_ventas_fecha' });
  pgm.createIndex('ventas', 'status', { name: 'idx_ventas_status' });
  pgm.createIndex('categorias', 'negocio_id', { name: 'idx_categorias_negocio' });
  pgm.createIndex('ventas_items', 'venta_id', { name: 'idx_ventas_items_venta' });
};

exports.down = async (pgm) => {
  // Drop tables in reverse order of creation (respecting foreign keys)
  pgm.dropTable('ventas_items');
  pgm.dropTable('ventas_canceladas');
  pgm.dropTable('ventas');
  pgm.dropTable('productos');
  pgm.dropTable('configuraciones');
  pgm.dropTable('categorias');
  pgm.dropTable('usuarios');
  pgm.dropTable('negocios');
};
