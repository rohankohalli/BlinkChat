import { InviteRepository } from '../repositories/InviteRepository.js';
import { ConversationRepository } from '../repositories/ConversationRepository.js';
import AppError from '../utils/AppError.js';

export const InviteService = {
  async sendInvite({ conversationId, fromUserId, toUserId }) {
    if (fromUserId === toUserId) {
      throw new AppError('You cannot invite yourself', 400);
    }

    // Check if conversation exists and user is part of it
    const isParticipant = await ConversationRepository.isParticipant(conversationId, fromUserId);
    if (!isParticipant) {
      throw new AppError('Not authorized to send invites for this room', 403);
    }

    // Check if invite already exists
    const exists = await InviteRepository.exists(conversationId, toUserId);
    if (exists) {
      throw new AppError('Invite already pending for this user', 409);
    }

    // Check if target user is already a participant
    const alreadyJoined = await ConversationRepository.isParticipant(conversationId, toUserId);
    if (alreadyJoined) {
      throw new AppError('User is already in this conversation', 409);
    }

    const inviteId = await InviteRepository.create({ conversationId, fromUserId, toUserId });
    return { inviteId };
  },

  async listInvites(userId) {
    return await InviteRepository.getPendingInvites(userId);
  },

  async respondToInvite(inviteId, userId, action) {
    if (!['accept', 'decline'].includes(action)) {
      throw new AppError('Invalid action', 400);
    }

    const invite = await InviteRepository.findById(inviteId);
    if (!invite || invite.to_user_id !== userId) {
      throw new AppError('Invite not found', 404);
    }

    if (invite.status !== 'pending') {
      throw new AppError('Invite already processed', 400);
    }

    if (action === 'accept') {
      await InviteRepository.updateStatus(inviteId, 'accepted');
      await ConversationRepository.addParticipant(invite.conversation_id, userId, 'member');
      return { message: 'Invite accepted', conversationId: invite.conversation_id };
    } else {
      await InviteRepository.updateStatus(inviteId, 'declined');
      return { message: 'Invite declined' };
    }
  }
};
