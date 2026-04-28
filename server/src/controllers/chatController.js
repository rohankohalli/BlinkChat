import { generateRoomCode } from '../utils/generateRoomCode.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { Conversation } from '../models/Conversation.js';

export const createConversation = async (req, res, next) => {
  try {
    const { type, name, ttl_hours, target_user_id } = req.body;
    const userId = req.user.id;

    if (!['direct', 'group', 'ephemeral'].includes(type)) {
      return sendError(res, 'Invalid conversation type', 400);
    }

    // Direct message logic
    if (type === 'direct') {
      if (!target_user_id) return sendError(res, 'target_user_id required for direct chats', 400);
      
      const existing = await Conversation.findDirect(userId, target_user_id);
      if (existing) {
        return sendSuccess(res, { conversationId: existing.id });
      }

      const convId = await Conversation.create({ type: 'direct', created_by: userId });
      await Conversation.addParticipant(convId, userId, 'owner');
      await Conversation.addParticipant(convId, target_user_id, 'member');
      return sendSuccess(res, { conversationId: convId }, 'Direct chat created', 201);
    }

    // Ephemeral / Group logic
    let roomCode = null;
    let expiresAt = null;

    if (type === 'ephemeral') {
      roomCode = generateRoomCode();
      const ttl = ttl_hours || 24;
      expiresAt = new Date(Date.now() + ttl * 60 * 60 * 1000);
    }

    const convId = await Conversation.create({ 
      type, 
      name: name || null, 
      ttl_hours: ttl_hours || null, 
      room_code: roomCode, 
      created_by: userId, 
      expires_at: expiresAt 
    });

    await Conversation.addParticipant(convId, userId, 'owner');

    sendSuccess(res, { conversationId: convId, roomCode }, 'Conversation created', 201);
  } catch (err) {
    next(err);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const conversations = await Conversation.getUserConversations(userId);
    sendSuccess(res, conversations);
  } catch (err) {
    next(err);
  }
};

export const joinEphemeralRoom = async (req, res, next) => {
  try {
    const { roomCode } = req.body;
    const userId = req.user.id;

    if (!roomCode) return sendError(res, 'Room code required', 400);

    const room = await Conversation.findByRoomCode(roomCode);
    if (!room) return sendError(res, 'Room not found', 404);
    
    if (room.expires_at && new Date(room.expires_at) < new Date()) {
      return sendError(res, 'Room has expired', 410);
    }

    await Conversation.addParticipant(room.id, userId, 'member');
    sendSuccess(res, { conversationId: room.id }, 'Joined successfully');
  } catch (err) {
    next(err);
  }
};
