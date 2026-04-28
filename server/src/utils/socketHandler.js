import { verifyToken } from './jwt.js';
import pool from '../config/db.js';

export default (io) => {
  // Authentication middleware for Socket.IO
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = verifyToken(token);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.id})`);

    // Update user status to online in DB
    try {
      await pool.execute('UPDATE users SET status = "online", last_seen = NOW() WHERE id = ?', [socket.user.id]);
      // Broadcast presence update
      io.emit('user_status_change', { userId: socket.user.id, status: 'online' });
    } catch (err) {
      console.error('Presence update error:', err);
    }

    // Join personal room for notifications
    socket.join(`user_${socket.user.id}`);

    // Automatically join all existing conversation rooms
    try {
      const [userConvs] = await pool.execute(
        'SELECT conversation_id FROM conversation_participants WHERE user_id = ?',
        [socket.user.id]
      );
      userConvs.forEach(conv => {
        socket.join(`conv_${conv.conversation_id}`);
      });
      console.log(`${socket.user.username} joined ${userConvs.length} conversation rooms`);
    } catch (err) {
      console.error('Error joining user to rooms:', err);
    }

    // Handle joining new rooms (e.g. when creating or joining an ephemeral room)
    socket.on('join_room', (conversationId) => {
      socket.join(`conv_${conversationId}`);
      console.log(`${socket.user.username} explicitly joined room: conv_${conversationId}`);
    });

    socket.on('leave_room', (conversationId) => {
      socket.leave(`conv_${conversationId}`);
      console.log(`${socket.user.username} left room: conv_${conversationId}`);
    });

    // Handle typing status
    socket.on('typing_start', (conversationId) => {
      socket.to(`conv_${conversationId}`).emit('user_typing', {
        userId: socket.user.id,
        username: socket.user.username,
        conversationId
      });
    });

    socket.on('typing_stop', (conversationId) => {
      socket.to(`conv_${conversationId}`).emit('user_stop_typing', {
        userId: socket.user.id,
        conversationId
      });
    });

    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.user.username}`);
      try {
        await pool.execute('UPDATE users SET status = "offline", last_seen = NOW() WHERE id = ?', [socket.user.id]);
        io.emit('user_status_change', { userId: socket.user.id, status: 'offline' });
      } catch (err) {
        console.error('Presence disconnect error:', err);
      }
    });
  });
};
