import pool from '../config/db.js';

export const getOnlineUsers = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, username, avatar, status, last_seen
       FROM users
       WHERE status = 'online' AND id != ?
       ORDER BY username ASC`,
      [req.user.id]
    );
    res.json({ users: rows });
  } catch (err) {
    console.error('GetOnlineUsers error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2)
      return res.status(400).json({ error: 'Query must be at least 2 characters' });

    const [rows] = await pool.execute(
      `SELECT id, username, avatar, status
       FROM users
       WHERE username LIKE ? AND id != ?
       LIMIT 20`,
      [`%${q.trim()}%`, req.user.id]
    );
    res.json({ users: rows });
  } catch (err) {
    console.error('SearchUsers error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
