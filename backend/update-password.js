import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'pos',
  password: process.env.DB_PASSWORD || 'pos',
  database: process.env.DB_NAME || 'punto_venta',
});

async function updatePassword() {
  try {
    const bcrypt = await import('bcryptjs');
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.default.hash(newPassword, 12);
    
    const result = await pool.query(
      'UPDATE usuarios SET password = $1 WHERE email = $2 RETURNING id, email',
      [hashedPassword, 'admin@admin.com']
    );
    
    console.log('Password updated for:', result.rows[0]);
    console.log('New password hash:', hashedPassword);
  } catch (error) {
    console.error('Error updating password:', error);
  } finally {
    await pool.end();
  }
}

updatePassword();