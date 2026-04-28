import pool from '../config/db.js';

export const sendInvite = async (req, res) => {
  try {
    const { to_user_id, conversation_id } = req.body;
    const from_user_id = req.user.id;

    if (!to_user_id || !conversation_id) {
      return res.status(400).json({ error: 'to_user_id and conversation_id are required' });
    }

    // Verify sender is in the conversation
    const [senderInConv] = await pool.execute(
      'SELECT id FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
      [conversation_id, from_user_id]
    );
    if (senderInConv.length === 0) {
      return res.status(403).json({ error: 'Not authorized to invite to this conversation' });
    }

    // Check if invite already pending
    const [existing] = await pool.execute(
      'SELECT id FROM invites WHERE conversation_id = ? AND to_user_id = ? AND status = "pending"',
      [conversation_id, to_user_id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Invite already pending' });
    }

    await pool.execute(
      'INSERT INTO invites (conversation_id, from_user_id, to_user_id) VALUES (?, ?, ?)',
      [conversation_id, from_user_id, to_user_id]
    );

    res.status(201).json({ message: 'Invite sent successfully' });
  } catch (err) {
    console.error('SendInvite error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPendingInvites = async (req, res) => {
  try {
    const [invites] = await pool.execute(`
      SELECT i.id, i.conversation_id, c.name as conversation_name, c.type, 
             u.username as from_username, u.avatar as from_avatar, i.created_at
      FROM invites i
      JOIN conversations c ON i.conversation_id = c.id
      JOIN users u ON i.from_user_id = u.id
      WHERE i.to_user_id = ? AND i.status = 'pending'
      ORDER BY i.created_at DESC
    `, [req.user.id]);

    res.json({ invites });
  } catch (err) {
    console.error('GetPendingInvites error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const respondToInvite = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'accept' or 'decline'
    const userId = req.user.id;

    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({ error: 'Action must be accept or decline' });
    }

    const [invites] = await pool.execute(
      'SELECT conversation_id FROM invites WHERE id = ? AND to_user_id = ? AND status = "pending"',
      [id, userId]
    );

    if (invites.length === 0) {
      return res.status(404).json({ error: 'Invite not found or already processed' });
    }

    const conversationId = invites[0].conversation_id;

    if (action === 'accept') {
      await pool.execute(
        'INSERT IGNORE INTO conversation_participants (conversation_id, user_id, role) VALUES (?, ?, ?)',
        [conversationId, userId, 'member']
      );
    }

    await pool.execute('UPDATE invites SET status = ? WHERE id = ?', [action + 'ed', id]); // 'accepted' or 'declined'

    res.json({ message: `Invite ${action}ed successfully` });
  } catch (err) {
    console.error('RespondToInvite error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
