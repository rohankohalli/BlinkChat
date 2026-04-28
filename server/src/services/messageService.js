import { MessageRepository } from '../repositories/MessageRepository.js';
import { ConversationRepository } from '../repositories/ConversationRepository.js';
import AppError from '../utils/AppError.js';

export const MessageService = {
  async sendMessage({ conversationId, content, userId, username, io }) {
    if (!conversationId || !content) {
      throw new AppError('Conversation ID and content are required', 400);
    }

    const isParticipant = await ConversationRepository.isParticipant(conversationId, userId);
    if (!isParticipant) {
      throw new AppError('Not authorized to send messages here', 403);
    }

    const messageId = await MessageRepository.create({ conversationId, senderId: userId, content });
    await ConversationRepository.updateLastMessage(conversationId);

    const newMessage = {
      id: messageId,
      conversation_id: conversationId,
      sender_id: userId,
      username: username,
      content,
      created_at: new Date()
    };

    if (io) {
      io.to(`conv_${conversationId}`).emit('new_message', newMessage);
    }

    return newMessage;
  },

  async getMessages(conversationId, userId) {
    const isParticipant = await ConversationRepository.isParticipant(conversationId, userId);
    if (!isParticipant) {
      throw new AppError('Not authorized to view these messages', 403);
    }

    return await MessageRepository.getByConversationId(conversationId);
  }
};
