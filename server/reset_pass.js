import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const resetPassword = async (username, newPassword) => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const hash = await bcrypt.hash(newPassword, 10);
  await pool.execute('UPDATE users SET password = ? WHERE username = ?', [hash, username]);
  console.log(`Password for ${username} reset to: ${newPassword}`);
  await pool.end();
};

const args = process.argv.slice(2);
if (args.length < 1) {
  console.log('Usage: node reset_pass.js <username>');
  process.exit(1);
}

resetPassword(args[0], 'password123');
