import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'pos',
  password: process.env.DB_PASSWORD || 'pos',
  database: process.env.DB_NAME || 'punto_venta',
});

async function debugLogin() {
  try {
    console.log('=== DEBUG LOGIN PROCESS ===');
    
    // 1. Check if user exists
    const email = 'admin@admin.com';
    console.log(`1. Checking for user with email: ${email}`);
    const userResult = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email.toLowerCase().trim()]);
    console.log(`   Found ${userResult.rows.length} users`);
    
    if (userResult.rows.length === 0) {
      console.log('   ERROR: No user found with that email');
      return;
    }
    
    const user = userResult.rows[0];
    console.log(`   User found: id=${user.id}, email=${user.email}, password_hash=${user.password.substring(0, 20)}...`);
    
    // 2. Check business
    console.log(`2. Checking business for user id ${user.negocio_id}`);
    const businessResult = await pool.query('SELECT * FROM negocios WHERE id = $1 AND activo = true', [user.negocio_id]);
    console.log(`   Found ${businessResult.rows.length} active businesses`);
    
    if (businessResult.rows.length === 0) {
      console.log('   ERROR: No active business found for user');
      // Let's check if business exists but is inactive
      const businessAnyResult = await pool.query('SELECT * FROM negocios WHERE id = $1', [user.negocio_id]);
      console.log(`   Business exists (any status): ${businessAnyResult.rows.length > 0}`);
      if (businessAnyResult.rows.length > 0) {
        console.log(`   Business details: activo=${businessAnyResult.rows[0].activo}`);
      }
      return;
    }
    
    const negocio = businessResult.rows[0];
    console.log(`   Business found: id=${negocio.id}, nombre=${negocio.nombre}, activo=${negocio.activo}`);
    
    // 3. Check password
    console.log('3. Checking password');
    const password = 'admin123'; // The password we just set
    const validPassword = await bcrypt.compare(password, user.password);
    console.log(`   Password '${password}' valid: ${validPassword}`);
    
    if (!validPassword) {
      console.log('   ERROR: Password validation failed for admin123');
      // Let's see what's in the password field
      console.log(`   Stored password hash: ${user.password}`);
      return;
    }
    
    console.log('✅ All checks passed! Login should work.');
    
  } catch (error) {
    console.error('❌ DEBUG ERROR:', error);
  } finally {
    await pool.end();
  }
}

debugLogin();