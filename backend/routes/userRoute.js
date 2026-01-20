import express from 'express';
import { verifySignupOTP,signup,login,forgotPassword,verifyForgotOTP,adminLogin } from '../controllers/Login.js';

const userRouter = express.Router();

userRouter.post('/signup',signup)
userRouter.post('/verifySignupOTP',verifySignupOTP)
userRouter.post('/login',login)
userRouter.post('/forgotPassword',forgotPassword)
userRouter.post('/verifyForgotOTP',verifyForgotOTP)
//userRouter.post('/admin',adminLogin)


export default userRouter;