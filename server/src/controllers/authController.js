import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { User } from '../models/User.js';

export const register = async (req, res, next) => {
  try {
    const { username, email, password, avatar } = req.body;

    if (!username || !email || !password)
      return sendError(res, 'Username, email and password are required', 400);
    
    if (password.length < 6)
      return sendError(res, 'Password must be at least 6 characters', 400);

    const exists = await User.exists(email, username);
    if (exists)
      return sendError(res, 'Username or email already taken', 409);

    const password_hash = await bcrypt.hash(password, 12);
    const avatarChoice = avatar || 'avatar_1';

    const user = await User.create({ username, email, password_hash, avatar: avatarChoice });
    sendSuccess(res, { user, token: generateToken(user) }, 'User registered successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return sendError(res, 'Email and password are required', 400);

    const user = await User.findByEmail(email);
    if (!user)
      return sendError(res, 'Invalid credentials', 401);

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match)
      return sendError(res, 'Invalid credentials', 401);

    delete user.password_hash;
    sendSuccess(res, { user, token: generateToken(user) }, 'Logged in successfully');
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user)
      return sendError(res, 'User not found', 404);

    sendSuccess(res, { user });
  } catch (err) {
    next(err);
  }
};
