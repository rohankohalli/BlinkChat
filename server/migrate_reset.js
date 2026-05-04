import mysql from 'mysql2/promise';

const migrate = async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await pool.execute('ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL, ADD COLUMN reset_token_expiry TIMESTAMP NULL');
    console.log('Migration successful: Columns added.');
  } catch (err) {
    if (err.code === 'ER_DUP_COLUMN_NAME') {
      console.log('Columns already exist.');
    } else {
      console.error('Migration failed:', err);
    }
  } finally {
    await pool.end();
  }
};

migrate();
