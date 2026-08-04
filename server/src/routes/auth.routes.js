import express from "express";
import {
  registerUser,
  loginUser,
  googleLogin,
  completeProfile,
  logoutUser,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const route = express.Router();

route.post("/register", registerUser);
route.post("/login", loginUser);
route.post("/google", googleLogin);
route.post("/logout", logoutUser);

route.post("/complete-profile", requireAuth, completeProfile);

export default route;