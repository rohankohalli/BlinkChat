import api from './api';

const inviteService = {
  sendInvite: (conversationId, toUserId) => 
    api.post('/invites', { conversationId, toUserId }),

  getPendingInvites: () => 
    api.get('/invites'),

  respondToInvite: (inviteId, action) => 
    api.put(`/invites/${inviteId}`, { action })
};

export default inviteService;
