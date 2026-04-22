import jwt from 'jsonwebtoken';
import env from '../config/env.js';

export const generateToken = (user) =>
  jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );

export const verifyToken = (token) =>
  jwt.verify(token, env.JWT_SECRET);
