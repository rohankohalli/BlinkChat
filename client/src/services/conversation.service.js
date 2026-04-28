import api from './api';

export const getConversations = () => api.get('/conversations');
export const createConversation = (data) => api.post('/conversations', data);
export const joinRoom = (roomCode) => api.post('/conversations/join', { roomCode });

export const leaveRoom = (id) => api.delete(`/conversations/${id}/leave`);

const conversationService = {
  getConversations,
  createConversation,
  joinRoom,
  leaveRoom
};

export default conversationService;
