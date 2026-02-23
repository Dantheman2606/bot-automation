import pool, { initDB } from '../lib/db';

async function setupDatabase() {
  try {
    console.log('Initializing database...');
    await initDB();
    console.log('Database setup completed successfully!');
    
    // Test connection
    const result = await pool.query('SELECT NOW()');
    console.log('Database connection test successful:', result.rows[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
