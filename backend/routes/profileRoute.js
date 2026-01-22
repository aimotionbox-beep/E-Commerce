import express from "express";
import { getProfile } from "../controllers/profileController.js";
import authUser from "../middleware/auth.js";

const profileRouter = express.Router();

// ✅ middleware FIRST, controller SECOND
profileRouter.get("/get-profile", authUser, getProfile);

export default profileRouter;
