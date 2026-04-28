import { UserRepository } from '../repositories/UserRepository.js';

export const UserService = {
  async getOnlineUsers(userId) {
    return await UserRepository.getOnline(userId);
  },

  async searchUsers(query, userId) {
    return await UserRepository.search(query, userId);
  }
};
