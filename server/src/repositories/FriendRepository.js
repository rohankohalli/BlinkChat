import pool from '../config/db.js';
import { FriendshipSchema } from '../models/Friendship.js';
import { UserSchema } from '../models/User.js';

export const FriendRepository = {
  async sendRequest(userId1, userId2) {
    const [result] = await pool.execute(
      `INSERT INTO ${FriendshipSchema.tableName} (user_id1, user_id2, status) VALUES (?, ?, ?)`,
      [userId1, userId2, FriendshipSchema.status.PENDING]
    );
    return result.insertId;
  },

  async updateStatus(userId1, userId2, status) {
    // We handle both directions since either could have initiated
    return await pool.execute(
      `UPDATE ${FriendshipSchema.tableName} 
       SET status = ? 
       WHERE (user_id1 = ? AND user_id2 = ?) OR (user_id1 = ? AND user_id2 = ?)`,
      [status, userId1, userId2, userId2, userId1]
    );
  },

  async getFriends(userId) {
    const [rows] = await pool.execute(`
      SELECT u.id, u.username, u.avatar, u.status, f.status as friendship_status
      FROM ${UserSchema.tableName} u
      JOIN ${FriendshipSchema.tableName} f ON (u.id = f.user_id1 OR u.id = f.user_id2)
      WHERE (f.user_id1 = ? OR f.user_id2 = ?) AND u.id != ? AND f.status = ?
    `, [userId, userId, userId, FriendshipSchema.status.ACCEPTED]);
    return rows;
  },

  async getPendingRequests(userId) {
    const [rows] = await pool.execute(`
      SELECT u.id, u.username, u.avatar, f.created_at
      FROM ${UserSchema.tableName} u
      JOIN ${FriendshipSchema.tableName} f ON u.id = f.user_id1
      WHERE f.user_id2 = ? AND f.status = ?
    `, [userId, FriendshipSchema.status.PENDING]);
    return rows;
  },

  async getRelationship(userId1, userId2) {
    const [rows] = await pool.execute(
      `SELECT * FROM ${FriendshipSchema.tableName} 
       WHERE (user_id1 = ? AND user_id2 = ?) OR (user_id1 = ? AND user_id2 = ?)`,
      [userId1, userId2, userId2, userId1]
    );
    return rows[0];
  },

  async removeFriend(userId1, userId2) {
    return await pool.execute(
      `DELETE FROM ${FriendshipSchema.tableName} 
       WHERE (user_id1 = ? AND user_id2 = ?) OR (user_id1 = ? AND user_id2 = ?)`,
      [userId1, userId2, userId2, userId1]
    );
  }
};
