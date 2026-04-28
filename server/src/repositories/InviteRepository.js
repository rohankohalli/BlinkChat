import pool from '../config/db.js';
import { InviteSchema } from '../models/Invite.js';
import { UserSchema } from '../models/User.js';
import { ConversationSchema } from '../models/Conversation.js';

export const InviteRepository = {
  async create({ conversationId, fromUserId, toUserId }) {
    const [result] = await pool.execute(
      `INSERT INTO ${InviteSchema.tableName} (conversation_id, from_user_id, to_user_id) VALUES (?, ?, ?)`,
      [conversationId, fromUserId, toUserId]
    );
    return result.insertId;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT * FROM ${InviteSchema.tableName} WHERE id = ?`,
      [id]
    );
    return rows[0];
  },

  async updateStatus(id, status) {
    return await pool.execute(
      `UPDATE ${InviteSchema.tableName} SET status = ? WHERE id = ?`,
      [status, id]
    );
  },

  async getPendingInvites(userId) {
    const [rows] = await pool.execute(`
      SELECT i.*, u.username as from_username, c.name as conversation_name, c.type as conversation_type
      FROM ${InviteSchema.tableName} i
      JOIN ${UserSchema.tableName} u ON i.from_user_id = u.id
      JOIN ${ConversationSchema.tableName} c ON i.conversation_id = c.id
      WHERE i.to_user_id = ? AND i.status = 'pending'
    `, [userId]);
    return rows;
  },

  async exists(conversationId, toUserId) {
    const [rows] = await pool.execute(
      `SELECT id FROM ${InviteSchema.tableName} WHERE conversation_id = ? AND to_user_id = ? AND status = 'pending'`,
      [conversationId, toUserId]
    );
    return rows.length > 0;
  }
};
