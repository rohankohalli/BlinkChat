import { UserService } from '../services/userService.js';
import { sendSuccess } from '../utils/responseHandler.js';

export const getOnlineUsers = async (req, res, next) => {
  try {
    const users = await UserService.getOnlineUsers(req.user.id);
    sendSuccess(res, users);
  } catch (err) {
    next(err);
  }
};

export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    const users = await UserService.searchUsers(q || '', req.user.id);
    sendSuccess(res, users);
  } catch (err) {
    next(err);
  }
};
