import { Router } from 'express';
import { getMessages, sendMessage } from '../controllers/messageController.js';
import auth from '../middlewares/auth.js';

const router = Router();

router.use(auth);

router.get('/:conversationId', getMessages);
router.post('/', sendMessage);

export default router;
