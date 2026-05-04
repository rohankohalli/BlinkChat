import { Router } from 'express';
import { register, login, getMe, forgotPassword, resetPassword } from '../controllers/authController.js';
import auth from '../middlewares/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', auth, getMe);

export default router;
