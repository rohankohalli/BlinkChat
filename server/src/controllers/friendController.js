import { FriendService } from '../services/friendService.js';
import { sendSuccess } from '../utils/responseHandler.js';

export const sendRequest = async (req, res, next) => {
  try {
    const { friendId } = req.body;
    await FriendService.sendFriendRequest(req.user.id, friendId);
    sendSuccess(res, null, 'Friend request sent');
  } catch (err) {
    next(err);
  }
};

export const respondToRequest = async (req, res, next) => {
  try {
    const { friendId, action } = req.body; // action: 'accept' or 'reject'
    const result = await FriendService.respondToRequest(req.user.id, friendId, action);
    sendSuccess(res, result, `Friend request ${action}ed`);
  } catch (err) {
    next(err);
  }
};

export const getFriends = async (req, res, next) => {
  try {
    const friends = await FriendService.getFriendsList(req.user.id);
    sendSuccess(res, friends);
  } catch (err) {
    next(err);
  }
};

export const getPending = async (req, res, next) => {
  try {
    const requests = await FriendService.getPendingRequests(req.user.id);
    sendSuccess(res, requests);
  } catch (err) {
    next(err);
  }
};
