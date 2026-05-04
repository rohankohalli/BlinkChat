import api from './api';

export const sendFriendRequest = (friendId) => api.post('/friends/request', { friendId });
export const respondToRequest = (friendId, action) => api.post('/friends/respond', { friendId, action });
export const getFriends = () => api.get('/friends');
export const getPendingRequests = () => api.get('/friends/pending');

const friendService = {
  sendFriendRequest,
  respondToRequest,
  getFriends,
  getPendingRequests
};

export default friendService;
