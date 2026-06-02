import { PREDEFINED_SKILLS } from '../constants/skills.js';
import { Request, Response } from 'express';

export const getSkills = (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: PREDEFINED_SKILLS });
};
