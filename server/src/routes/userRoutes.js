import { Router } from 'express';
import { getOnlineUsers, searchUsers } from '../controllers/userController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/online', auth, getOnlineUsers);
router.get('/search', auth, searchUsers);

export default router;
