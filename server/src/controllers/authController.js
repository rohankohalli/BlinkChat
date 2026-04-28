import { AuthService } from '../services/authService.js';
import { sendSuccess } from '../utils/responseHandler.js';

export const register = async (req, res, next) => {
  try {
    const data = await AuthService.register(req.body);
    sendSuccess(res, data, 'User registered successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const data = await AuthService.login(req.body);
    sendSuccess(res, data, 'Logged in successfully');
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await AuthService.getMe(req.user.id);
    sendSuccess(res, { user });
  } catch (err) {
    next(err);
  }
};
