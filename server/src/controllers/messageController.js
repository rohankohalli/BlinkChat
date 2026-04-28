import pool from '../config/db.js';

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Verify user is part of the conversation
    const [participants] = await pool.execute(
      'SELECT id FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
      [conversationId, userId]
    );

    if (participants.length === 0) {
      return res.status(403).json({ error: 'Not authorized to view these messages' });
    }

    const [messages] = await pool.execute(`
      SELECT m.id, m.content, m.type, m.created_at, m.sender_id, u.username, u.avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC
      LIMIT 100
    `, [conversationId]);

    res.json({ messages });
  } catch (err) {
    console.error('GetMessages error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content, type = 'text' } = req.body;
    const userId = req.user.id;

    if (!content) return res.status(400).json({ error: 'Message content required' });

    // Verify participant
    const [participants] = await pool.execute(
      'SELECT id FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
      [conversationId, userId]
    );

    if (participants.length === 0) {
      return res.status(403).json({ error: 'Not authorized to send messages here' });
    }

    const [result] = await pool.execute(
      'INSERT INTO messages (conversation_id, sender_id, content, type) VALUES (?, ?, ?, ?)',
      [conversationId, userId, content, type]
    );

    const messageId = result.insertId;

    // Update conversation last_message_at
    await pool.execute(
      'UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?',
      [conversationId]
    );

    // Fetch full message with sender info for broadcasting
    const [msgs] = await pool.execute(`
      SELECT m.id, m.content, m.type, m.created_at, m.sender_id, m.conversation_id, u.username, u.avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = ?
    `, [messageId]);

    const newMessage = msgs[0];

    // Broadcast via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`conv_${conversationId}`).emit('new_message', newMessage);
    }

    res.status(201).json({ message: newMessage });
  } catch (err) {
    console.error('SendMessage error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
