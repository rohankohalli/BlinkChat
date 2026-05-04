import { FriendRepository } from '../repositories/FriendRepository.js';
import { ConversationRepository } from '../repositories/ConversationRepository.js';
import { FriendshipSchema } from '../models/Friendship.js';
import AppError from '../utils/AppError.js';

export const FriendService = {
  async sendFriendRequest(senderId, receiverId) {
    if (senderId === receiverId) {
      throw new AppError('You cannot friend yourself', 400);
    }

    const existing = await FriendRepository.getRelationship(senderId, receiverId);
    if (existing) {
      throw new AppError('Relationship already exists or request pending', 400);
    }

    return await FriendRepository.sendRequest(senderId, receiverId);
  },

  async respondToRequest(userId, friendId, action) {
    const relationship = await FriendRepository.getRelationship(userId, friendId);
    
    if (!relationship || relationship.status !== FriendshipSchema.status.PENDING) {
      throw new AppError('No pending request found', 404);
    }

    // Only the receiver can accept
    if (relationship.user_id2 !== userId && action === 'accept') {
      throw new AppError('Unauthorized', 403);
    }

    if (action === 'accept') {
      await FriendRepository.updateStatus(userId, friendId, FriendshipSchema.status.ACCEPTED);
      
      // Automatically create a direct conversation if it doesn't exist
      const existingConv = await ConversationRepository.findDirect(userId, friendId);
      if (!existingConv) {
        const convId = await ConversationRepository.create({ type: 'direct', created_by: userId });
        await ConversationRepository.addParticipant(convId, userId);
        await ConversationRepository.addParticipant(convId, friendId);
      }
      return { status: 'accepted' };
    } else {
      await FriendRepository.removeFriend(userId, friendId);
      return { status: 'rejected' };
    }
  },

  async getFriendsList(userId) {
    return await FriendRepository.getFriends(userId);
  },

  async getPendingRequests(userId) {
    return await FriendRepository.getPendingRequests(userId);
  }
};
