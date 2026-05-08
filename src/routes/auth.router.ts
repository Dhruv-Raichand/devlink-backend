import Express from 'express';
const authRouter = Express.Router();
import { signup, login, logout } from '../controllers/auth.controller.js';
import rateLimit from 'express-rate-limit';

const authLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const resetTime = req.rateLimit?.resetTime;

    const retryAfterMs = resetTime
      ? new Date(resetTime).getTime() - Date.now()
      : 15 * 60 * 1000;

    const retryAfterMinutes = Math.ceil(retryAfterMs / 60000);

    res.status(429).json({
      message: `Too many attempts. Try again in ${retryAfterMinutes} minute(s)`,
      retryAfter: retryAfterMinutes,
    });
  },
});

authRouter.post('/signup', authLimit, signup);

authRouter.post('/login', authLimit, login);

authRouter.post('/logout', logout);

export default authRouter;
