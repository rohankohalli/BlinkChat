import { generateRoomCode } from '../utils/generateRoomCode.js';
import { ConversationRepository } from '../repositories/ConversationRepository.js';
import AppError from '../utils/AppError.js';

export const ChatService = {
  async createConversation({ type, name, ttl_hours, target_user_id, userId }) {
    if (!['direct', 'group', 'ephemeral'].includes(type)) {
      throw new AppError('Invalid conversation type', 400);
    }

    if (type === 'direct') {
      if (!target_user_id) throw new AppError('target_user_id required for direct chats', 400);
      
      const existing = await ConversationRepository.findDirect(userId, target_user_id);
      if (existing) return { conversationId: existing.id };

      const convId = await ConversationRepository.create({ type: 'direct', created_by: userId });
      await ConversationRepository.addParticipant(convId, userId, 'owner');
      await ConversationRepository.addParticipant(convId, target_user_id, 'member');
      return { conversationId: convId };
    }

    let roomCode = null;
    let expiresAt = null;

    if (type === 'ephemeral') {
      roomCode = generateRoomCode();
      const ttl = ttl_hours || 24;
      expiresAt = new Date(Date.now() + ttl * 60 * 60 * 1000);
    }

    const convId = await ConversationRepository.create({ 
      type, 
      name: name || null, 
      ttl_hours: ttl_hours || null, 
      room_code: roomCode, 
      created_by: userId, 
      expires_at: expiresAt 
    });

    await ConversationRepository.addParticipant(convId, userId, 'owner');
    return { conversationId: convId, roomCode };
  },

  async listConversations(userId) {
    return await ConversationRepository.getUserConversations(userId);
  },

  async joinRoom(roomCode, userId) {
    if (!roomCode) throw new AppError('Room code required', 400);

    const room = await ConversationRepository.findByRoomCode(roomCode);
    if (!room) throw new AppError('Room not found', 404);
    
    if (room.expires_at && new Date(room.expires_at) < new Date()) {
      throw new AppError('Room has expired', 410);
    }

    await ConversationRepository.addParticipant(room.id, userId, 'member');
    return { conversationId: room.id };
  },

  async leaveRoom(conversationId, userId) {
    const isParticipant = await ConversationRepository.isParticipant(conversationId, userId);
    if (!isParticipant) {
      throw new AppError('You are not in this room', 404);
    }
    return await ConversationRepository.removeParticipant(conversationId, userId);
  }
};
