import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { User } from '../models/User.js';

export const getOnlineUsers = async (req, res, next) => {
  try {
    const users = await User.getOnline(req.user.id);
    sendSuccess(res, users);
  } catch (err) {
    next(err);
  }
};

export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2)
      return sendError(res, 'Query must be at least 2 characters', 400);

    const users = await User.search(q.trim(), req.user.id);
    sendSuccess(res, users);
  } catch (err) {
    next(err);
  }
};
