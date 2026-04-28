import pool from '../config/db.js';
import { ConversationSchema } from '../models/Conversation.js';

export const ConversationRepository = {
  async findDirect(user1Id, user2Id) {
    const [rows] = await pool.execute(`
      SELECT c.id FROM ${ConversationSchema.tableName} c
      JOIN ${ConversationSchema.participantTable} p1 ON c.id = p1.conversation_id
      JOIN ${ConversationSchema.participantTable} p2 ON c.id = p2.conversation_id
      WHERE c.type = 'direct' AND p1.user_id = ? AND p2.user_id = ?
    `, [user1Id, user2Id]);
    return rows[0];
  },

  async create({ type, name = null, ttl_hours = null, room_code = null, created_by, expires_at = null }) {
    const [result] = await pool.execute(
      `INSERT INTO ${ConversationSchema.tableName} (type, name, ttl_hours, room_code, created_by, expires_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [type, name, ttl_hours, room_code, created_by, expires_at]
    );
    return result.insertId;
  },

  async addParticipant(conversationId, userId, role = 'member') {
    return await pool.execute(
      `INSERT IGNORE INTO ${ConversationSchema.participantTable} (conversation_id, user_id, role) VALUES (?, ?, ?)`,
      [conversationId, userId, role]
    );
  },

  async getUserConversations(userId) {
    const [rows] = await pool.execute(`
      SELECT c.id, c.type, c.name, c.room_code, c.last_message_at, c.expires_at,
             (SELECT COUNT(*) FROM ${ConversationSchema.participantTable} WHERE conversation_id = c.id) as participant_count
      FROM ${ConversationSchema.tableName} c
      JOIN ${ConversationSchema.participantTable} p ON c.id = p.conversation_id
      WHERE p.user_id = ? AND (c.expires_at IS NULL OR c.expires_at > NOW())
      ORDER BY c.last_message_at DESC, c.created_at DESC
    `, [userId]);
    return rows;
  },

  async findByRoomCode(code) {
    const [rows] = await pool.execute(
      `SELECT id, expires_at FROM ${ConversationSchema.tableName} WHERE type = "ephemeral" AND room_code = ?`,
      [code.toUpperCase()]
    );
    return rows[0];
  },

  async isParticipant(conversationId, userId) {
    const [rows] = await pool.execute(
      `SELECT id FROM ${ConversationSchema.participantTable} WHERE conversation_id = ? AND user_id = ?`,
      [conversationId, userId]
    );
    return rows.length > 0;
  },

  async updateLastMessage(id) {
    return await pool.execute(
      `UPDATE ${ConversationSchema.tableName} SET last_message_at = NOW() WHERE id = ?`,
      [id]
    );
  },

  async removeParticipant(conversationId, userId) {
    return await pool.execute(
      `DELETE FROM ${ConversationSchema.participantTable} WHERE conversation_id = ? AND user_id = ?`,
      [conversationId, userId]
    );
  }
};
