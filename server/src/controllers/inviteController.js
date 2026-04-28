import { InviteService } from '../services/inviteService.js';
import { sendSuccess } from '../utils/responseHandler.js';

export const sendInvite = async (req, res, next) => {
  try {
    const { conversationId, toUserId } = req.body;
    const data = await InviteService.sendInvite({
      conversationId,
      fromUserId: req.user.id,
      toUserId
    });
    sendSuccess(res, data, 'Invite sent successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const getMyInvites = async (req, res, next) => {
  try {
    const invites = await InviteService.listInvites(req.user.id);
    sendSuccess(res, invites);
  } catch (err) {
    next(err);
  }
};

export const respondToInvite = async (req, res, next) => {
  try {
    const { inviteId } = req.params;
    const { action } = req.body;
    const data = await InviteService.respondToInvite(inviteId, req.user.id, action);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};
