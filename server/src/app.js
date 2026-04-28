import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import inviteRoutes from './routes/inviteRoutes.js';
import errorHandler from './middlewares/errorHandler.js';

import socketHandler from './utils/socketHandler.js';

import helmet from 'helmet';
import morgan from 'morgan';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
});

// Middleware
app.use(helmet()); // Security headers
app.use(morgan('dev')); // Request logging
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/conversations', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/invites', inviteRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BlinkChat server is running' });
});

// Global error handler — must be last
app.use(errorHandler);

// Initialize Socket.IO Handler
socketHandler(io);

// Make io instance available in request for controllers (optional but useful)
app.set('io', io);

server.listen(process.env.PORT || 8000, () => {
  console.log(`BlinkChat server running on port ${process.env.PORT || 8000}`);
});
