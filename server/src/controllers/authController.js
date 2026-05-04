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

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    // We don't wait for success/failure to prevent timing attacks/email enumeration
    AuthService.forgotPassword(email).catch(err => console.error('Background forgot pass error:', err.message));
    
    sendSuccess(res, null, 'If an account exists with that email, a password reset link has been sent.');
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    await AuthService.resetPassword(token, password);
    sendSuccess(res, null, 'Password reset successfully. You can now login.');
  } catch (err) {
    next(err);
  }
};
