import { Router } from 'express';
import { sendInvite, getPendingInvites, respondToInvite } from '../controllers/inviteController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.use(auth);

router.post('/', sendInvite);
router.get('/', getPendingInvites);
router.put('/:id', respondToInvite);

export default router;
