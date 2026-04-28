import api from './api';

export const getConversations = () => api.get('/conversations');
export const createConversation = (data) => api.post('/conversations', data);
export const joinRoom = (roomCode) => api.post('/conversations/join', { roomCode });

const conversationService = {
  getConversations,
  createConversation,
  joinRoom
};

export default conversationService;
