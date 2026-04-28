import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { Message } from '../models/Message.js';
import { Conversation } from '../models/Conversation.js';

export const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, content } = req.body;
    const userId = req.user.id;

    if (!conversationId || !content) {
      return sendError(res, 'Conversation ID and content are required', 400);
    }

    const isParticipant = await Conversation.isParticipant(conversationId, userId);
    if (!isParticipant) {
      return sendError(res, 'Not authorized to send messages here', 403);
    }

    const messageId = await Message.create({ conversationId, senderId: userId, content });
    await Conversation.updateLastMessage(conversationId);

    const newMessage = {
      id: messageId,
      conversation_id: conversationId,
      sender_id: userId,
      username: req.user.username,
      content,
      created_at: new Date()
    };

    const io = req.app.get('io');
    if (io) {
      io.to(`conv_${conversationId}`).emit('new_message', newMessage);
    }

    sendSuccess(res, newMessage, 'Message sent successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const isParticipant = await Conversation.isParticipant(conversationId, userId);
    if (!isParticipant) {
      return sendError(res, 'Not authorized to view these messages', 403);
    }

    const messages = await Message.getByConversationId(conversationId);
    sendSuccess(res, messages);
  } catch (err) {
    next(err);
  }
};
