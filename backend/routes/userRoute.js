import express from 'express';
import {
  signup,
  verifySignupOTP,
  login,
  forgotPassword,
  verifyForgotOTP,
  adminLogin
} from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post('/signup', signup);
userRouter.post('/verify-signup-otp', verifySignupOTP);
userRouter.post('/login', login);
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/verify-forgot-otp', verifyForgotOTP);
userRouter.post('/admin', adminLogin);

export default userRouter;