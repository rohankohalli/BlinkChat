import { MessageService } from '../services/messageService.js';
import { sendSuccess } from '../utils/responseHandler.js';

export const sendMessage = async (req, res, next) => {
  try {
    const newMessage = await MessageService.sendMessage({
      ...req.body,
      userId: req.user.id,
      username: req.user.username,
      io: req.app.get('io')
    });
    sendSuccess(res, newMessage, 'Message sent successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const messages = await MessageService.getMessages(req.params.conversationId, req.user.id);
    sendSuccess(res, messages);
  } catch (err) {
    next(err);
  }
};
