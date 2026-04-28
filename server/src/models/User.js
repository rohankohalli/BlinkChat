import pool from '../config/db.js';

export const User = {
  async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT id, username, email, password_hash, avatar, status FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  },

  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, username, email, avatar, status, last_seen, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  async create({ username, email, password_hash, avatar }) {
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password_hash, avatar) VALUES (?, ?, ?, ?)',
      [username, email, password_hash, avatar]
    );
    return { id: result.insertId, username, email, avatar };
  },

  async exists(email, username) {
    const [rows] = await pool.execute(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );
    return rows.length > 0;
  },

  async getOnline(excludeId) {
    const [rows] = await pool.execute(
      `SELECT id, username, avatar, status, last_seen
       FROM users
       WHERE status = 'online' AND id != ?
       ORDER BY username ASC`,
      [excludeId]
    );
    return rows;
  },

  async search(query, excludeId) {
    const [rows] = await pool.execute(
      `SELECT id, username, avatar, status
       FROM users
       WHERE username LIKE ? AND id != ?
       LIMIT 20`,
      [`%${query}%`, excludeId]
    );
    return rows;
  }
};
