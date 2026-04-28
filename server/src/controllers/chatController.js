import { ChatService } from '../services/chatService.js';
import { sendSuccess } from '../utils/responseHandler.js';

export const createConversation = async (req, res, next) => {
  try {
    const data = await ChatService.createConversation({ 
      ...req.body, 
      userId: req.user.id 
    });
    sendSuccess(res, data, 'Conversation created', 201);
  } catch (err) {
    next(err);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const conversations = await ChatService.listConversations(req.user.id);
    sendSuccess(res, conversations);
  } catch (err) {
    next(err);
  }
};

export const joinEphemeralRoom = async (req, res, next) => {
  try {
    const data = await ChatService.joinRoom(req.body.roomCode, req.user.id);
    sendSuccess(res, data, 'Joined successfully');
  } catch (err) {
    next(err);
  }
};
