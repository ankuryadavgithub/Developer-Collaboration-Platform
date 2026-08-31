// server/src/routes/user.routes.js

import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { getMe, updateProfile, updatePassword, linkGoogle, unlinkGoogle, unlinkGithub } from "../controllers/user.controller.js";

const router = express.Router();

// Require user to be logged in for all routes
router.use(requireAuth);

router.get("/me", getMe);
router.patch("/me", updateProfile);
router.patch("/me/password", updatePassword);
router.post("/me/google", linkGoogle);
router.delete("/me/google", unlinkGoogle);
router.delete("/me/github", unlinkGithub);

export default router;