import jwt from 'jsonwebtoken';

export const generateToken = (user) =>
  jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

export const verifyToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET);
