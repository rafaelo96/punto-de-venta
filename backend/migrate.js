require('dotenv').config();

module.exports = {
  databaseUrl: process.env.DATABASE_URL || undefined,
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'postgres',
    ssl: process.env.DB_SSL === 'true' || process.env.DB_PORT === '6543' ? { rejectUnauthorized: false } : false,
  },
  migrationsDir: 'migrations',
  schema: 'public',
};
