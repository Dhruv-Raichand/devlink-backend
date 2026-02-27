import Express from 'express';
const authRouter = Express.Router();
import User from '../models/user.js';
import bcrypt from 'bcrypt';
import { validate } from '../utils/validate.js';
import sanitizeUser from '../utils/helper.js';

//Creating a new instance of the User model
authRouter.post('/signup', async (req: any, res: any): Promise<void> => {
  const { firstName, lastName, emailId, password } = req.body;
  try {
    //validate user data
    validate(req.body);
    //hashing user password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: hashedPassword,
    });
    const signedUser = await user.save();
    const Token = await signedUser.getJWT();
    //Add the token to cookie and send the response back to user
    res.cookie('token', Token, {
      expires: new Date(Date.now() + 24 * 7 * 3600000),
    });
    res.status(201).json({
      success: true,
      message: 'User Added Successfully!',
      data: sanitizeUser(signedUser),
    });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: 'This Email is already registered',
      });
    }
    res.status(400).json({
      message: 'Error in saving the user',
      errMessage: err.message,
    });
  }
});

//login user
authRouter.post('/login', async (req: any, res: any): Promise<void> => {
  const { emailId, password } = req.body;
  try {
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error('Invalid Credentials');
    }
    const isCorrect = await user.comparePasswords(password);
    if (isCorrect) {
      //create JWT token
      const Token = await user.getJWT();
      //Add the token to cookie and send the response back to user
      res.cookie('token', Token, {
        expires: new Date(Date.now() + 24 * 7 * 3600000),
      });
      res.json({
        success: true,
        message: 'Login Successful',
        data: sanitizeUser(user),
      });
    } else {
      throw new Error('Invalid Credentials');
    }
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

//logout
authRouter.post('/logout', (req: any, res: any): void => {
  res.cookie('token', null, { expires: new Date(Date.now()) });
  res.json({
    success: true,
    message: 'Logout successful',
  });
});

export default authRouter;
