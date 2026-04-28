import { Router } from 'express';
import { sendInvite, getMyInvites, respondToInvite } from '../controllers/inviteController.js';
import auth from '../middlewares/auth.js';

const router = Router();

router.use(auth);

router.post('/', sendInvite);
router.get('/', getMyInvites);
router.put('/:inviteId', respondToInvite);

export default router;
