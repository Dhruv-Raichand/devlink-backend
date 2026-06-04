import { PREDEFINED_SKILLS } from '../constants/skills.js';
import { Request, Response } from 'express';
import { SendResponse } from '../utils/sendResponse.js';

export const getSkills = (req: Request, res: Response) => {
  SendResponse(res, 200, 'Skills retrieved successfully', PREDEFINED_SKILLS);
};
