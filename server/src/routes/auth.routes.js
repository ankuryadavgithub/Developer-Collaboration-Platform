import express from "express";
import {
  registerUser,
  loginUser,
  googleLogin,
  completeProfile,
  logoutUser,
  githubLogin,
  githubCallback,
  getCurrentUser,
  getGithubProfile
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const route = express.Router();

route.post("/register", registerUser);
route.post("/login", loginUser);
route.post("/google", googleLogin);
route.post("/logout", requireAuth, logoutUser);
route.get("/github", githubLogin);
route.get("/github/callback", githubCallback);
route.get("/github/profile", getGithubProfile);

route.get("/me", requireAuth, getCurrentUser);

route.post("/complete-profile", requireAuth, completeProfile);

export default route;