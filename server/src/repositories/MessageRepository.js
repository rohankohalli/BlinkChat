import pool from '../config/db.js';
import { MessageSchema } from '../models/Message.js';
import { UserSchema } from '../models/User.js';

export const MessageRepository = {
  async create({ conversationId, senderId, content }) {
    const [result] = await pool.execute(
      `INSERT INTO ${MessageSchema.tableName} (conversation_id, sender_id, content) VALUES (?, ?, ?)`,
      [conversationId, senderId, content]
    );
    return result.insertId;
  },

  async getByConversationId(conversationId) {
    const [rows] = await pool.execute(`
      SELECT m.id, m.content, m.created_at, m.sender_id, m.conversation_id, u.username
      FROM ${MessageSchema.tableName} m
      JOIN ${UserSchema.tableName} u ON m.sender_id = u.id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC
    `, [conversationId]);
    return rows;
  }
};
