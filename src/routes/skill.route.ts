import express from 'express';
const skillRouter = express.Router();
import userAuth from '../middlewares/auth.js';
import { getSkills } from '../controllers/skill.controller.js';

skillRouter.get('/', userAuth, getSkills);

export default skillRouter;
