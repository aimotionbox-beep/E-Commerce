import express from 'express';
import { loginUser, registerUser, adminLogin } from '../controllers/userController.js';
import { getUserProfile, getUserProfileData, updateUserProfile } from '../controllers/profileController.js';
import authUser from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/admin', adminLogin);

// Profile routes (protected)
userRouter.post('/profile', authUser, getUserProfile);
userRouter.post('/profile-data', authUser, getUserProfileData);
userRouter.post('/update-profile', authUser, updateUserProfile);

export default userRouter;