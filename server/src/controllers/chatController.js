import pool from '../config/db.js';
import { generateRoomCode } from '../utils/generateRoomCode.js';

export const createConversation = async (req, res) => {
  try {
    const { type, name, ttl_hours, target_user_id } = req.body;
    const userId = req.user.id;

    if (!['direct', 'group', 'ephemeral'].includes(type)) {
      return res.status(400).json({ error: 'Invalid conversation type' });
    }

    // Direct message logic
    if (type === 'direct') {
      if (!target_user_id) return res.status(400).json({ error: 'target_user_id required for direct chats' });
      
      // Check if direct chat already exists
      const [existing] = await pool.execute(`
        SELECT c.id FROM conversations c
        JOIN conversation_participants p1 ON c.id = p1.conversation_id
        JOIN conversation_participants p2 ON c.id = p2.conversation_id
        WHERE c.type = 'direct' AND p1.user_id = ? AND p2.user_id = ?
      `, [userId, target_user_id]);

      if (existing.length > 0) {
        return res.json({ conversationId: existing[0].id });
      }

      const [result] = await pool.execute('INSERT INTO conversations (type, created_by) VALUES (?, ?)', ['direct', userId]);
      const convId = result.insertId;
      await pool.execute('INSERT INTO conversation_participants (conversation_id, user_id, role) VALUES (?, ?, ?)', [convId, userId, 'owner']);
      await pool.execute('INSERT INTO conversation_participants (conversation_id, user_id, role) VALUES (?, ?, ?)', [convId, target_user_id, 'member']);
      return res.status(201).json({ conversationId: convId });
    }

    // Ephemeral / Group logic
    let roomCode = null;
    let expiresAt = null;

    if (type === 'ephemeral') {
      roomCode = generateRoomCode();
      const ttl = ttl_hours || 24;
      expiresAt = new Date(Date.now() + ttl * 60 * 60 * 1000);
    }

    const [result] = await pool.execute(
      'INSERT INTO conversations (type, name, ttl_hours, room_code, created_by, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
      [type, name || null, ttl_hours || null, roomCode, userId, expiresAt]
    );
    const convId = result.insertId;

    await pool.execute('INSERT INTO conversation_participants (conversation_id, user_id, role) VALUES (?, ?, ?)', [convId, userId, 'owner']);

    res.status(201).json({ conversationId: convId, roomCode });
  } catch (err) {
    console.error('CreateConversation error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.execute(`
      SELECT c.id, c.type, c.name, c.room_code, c.last_message_at, c.expires_at,
             (SELECT COUNT(*) FROM conversation_participants WHERE conversation_id = c.id) as participant_count
      FROM conversations c
      JOIN conversation_participants p ON c.id = p.conversation_id
      WHERE p.user_id = ? AND (c.expires_at IS NULL OR c.expires_at > NOW())
      ORDER BY c.last_message_at DESC, c.created_at DESC
    `, [userId]);

    res.json({ conversations: rows });
  } catch (err) {
    console.error('GetConversations error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const joinEphemeralRoom = async (req, res) => {
  try {
    const { roomCode } = req.body;
    const userId = req.user.id;

    if (!roomCode) return res.status(400).json({ error: 'Room code required' });

    const [convs] = await pool.execute(
      'SELECT id, expires_at FROM conversations WHERE type = "ephemeral" AND room_code = ?',
      [roomCode.toUpperCase()]
    );

    if (convs.length === 0) return res.status(404).json({ error: 'Room not found' });
    
    const room = convs[0];
    if (room.expires_at && new Date(room.expires_at) < new Date()) {
      return res.status(410).json({ error: 'Room has expired' });
    }

    // Insert ignoring duplicates (if already joined)
    await pool.execute(
      'INSERT IGNORE INTO conversation_participants (conversation_id, user_id, role) VALUES (?, ?, ?)',
      [room.id, userId, 'member']
    );

    res.json({ conversationId: room.id, message: 'Joined successfully' });
  } catch (err) {
    console.error('JoinRoom error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
