import { PREDEFINED_SKILLS } from '../constants/skills.js';

export const getSkills = (req: any, res: any) => {
  res.status(200).json({ success: true, data: PREDEFINED_SKILLS });
};
