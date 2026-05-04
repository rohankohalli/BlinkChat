import pool from '../config/db.js';
import { UserSchema } from '../models/User.js';

export const UserRepository = {
  async findByEmail(email) {
    const [rows] = await pool.execute(
      `SELECT * FROM ${UserSchema.tableName} WHERE email = ?`,
      [email]
    );
    return rows[0];
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT id, username, email, avatar, status, last_seen, created_at FROM ${UserSchema.tableName} WHERE id = ?`,
      [id]
    );
    return rows[0];
  },

  async create({ username, email, password_hash, avatar }) {
    const [result] = await pool.execute(
      `INSERT INTO ${UserSchema.tableName} (username, email, password_hash, avatar) VALUES (?, ?, ?, ?)`,
      [username, email, password_hash, avatar]
    );
    return { id: result.insertId, username, email, avatar };
  },

  async exists(email, username) {
    const [rows] = await pool.execute(
      `SELECT id FROM ${UserSchema.tableName} WHERE email = ? OR username = ?`,
      [email, username]
    );
    return rows.length > 0;
  },

  async getOnline(excludeId) {
    const [rows] = await pool.execute(
      `SELECT id, username, avatar, status, last_seen
       FROM ${UserSchema.tableName}
       WHERE status = 'online' AND id != ?
       ORDER BY username ASC`,
      [excludeId]
    );
    return rows;
  },

  async search(query, excludeId) {
    const [rows] = await pool.execute(
      `SELECT id, username, avatar, status
       FROM ${UserSchema.tableName}
       WHERE username LIKE ? AND id != ?
       LIMIT 20`,
      [`%${query}%`, excludeId]
    );
    return rows;
  },

  async updateResetToken(email, token, expiry) {
    return await pool.execute(
      `UPDATE ${UserSchema.tableName} SET reset_token = ?, reset_token_expiry = ? WHERE email = ?`,
      [token, expiry, email]
    );
  },

  async findByResetToken(token) {
    const [rows] = await pool.execute(
      `SELECT * FROM ${UserSchema.tableName} WHERE reset_token = ?`,
      [token]
    );
    return rows[0];
  },

  async updatePassword(userId, passwordHash) {
    return await pool.execute(
      `UPDATE ${UserSchema.tableName} SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?`,
      [passwordHash, userId]
    );
  },

  filter(user) {
    if (!user) return null;
    const { password_hash, ...publicUser } = user;
    return publicUser;
  }
};
