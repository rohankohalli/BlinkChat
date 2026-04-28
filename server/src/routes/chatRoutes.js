import { Router } from 'express';
import { createConversation, getConversations, joinEphemeralRoom } from '../controllers/chatController.js';
import auth from '../middlewares/auth.js';

const router = Router();

router.use(auth); // All chat routes require auth

router.post('/', createConversation);
router.get('/', getConversations);
router.post('/join', joinEphemeralRoom);

export default router;
