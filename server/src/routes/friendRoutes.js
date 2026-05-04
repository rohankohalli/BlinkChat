import { Router } from 'express';
import * as FriendController from '../controllers/friendController.js';
import auth from '../middlewares/auth.js';

const router = Router();

router.use(auth);

router.post('/request', FriendController.sendRequest);
router.post('/respond', FriendController.respondToRequest);
router.get('/', FriendController.getFriends);
router.get('/pending', FriendController.getPending);

export default router;
