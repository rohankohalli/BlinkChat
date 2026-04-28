import api from './api';

export const getMessages = (conversationId) => api.get(`/messages/${conversationId}`);
export const sendMessage = (data) => api.post('/messages', data);

const messageService = {
  getMessages,
  sendMessage
};

export default messageService;
