import Express from 'express';
const authRouter = Express.Router();
import { signup, login, logout } from '../controllers/auth.controller.js';
import rateLimit from 'express-rate-limit';

const authLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many attempts, try again later',
});

authRouter.post('/signup', authLimit, signup);

authRouter.post('/login', authLimit, login);

authRouter.post('/logout', logout);

export default authRouter;
