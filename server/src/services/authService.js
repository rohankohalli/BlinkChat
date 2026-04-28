import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.js';
import { UserRepository } from '../repositories/UserRepository.js';
import AppError from '../utils/AppError.js';

export const AuthService = {
  async register({ username, email, password, avatar }) {
    if (!username || !email || !password) {
      throw new AppError('Username, email and password are required', 400);
    }
    
    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400);
    }

    const exists = await UserRepository.exists(email, username);
    if (exists) {
      throw new AppError('Username or email already taken', 409);
    }

    const password_hash = await bcrypt.hash(password, 12);
    const user = await UserRepository.create({ 
      username, 
      email, 
      password_hash, 
      avatar: avatar || 'avatar_1' 
    });

    return { 
      user, 
      token: generateToken(user) 
    };
  },

  async login({ email, password }) {
    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      throw new AppError('Invalid credentials', 401);
    }

    return { 
      user: UserRepository.filter(user), 
      token: generateToken(user) 
    };
  },

  async getMe(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }
};
