// server/src/routes/github.routes.js

import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  getCurrentSprint,
  getOpenIssues,
  getPullRequests,
} from "../controllers/github.controller.js";

const router = express.Router();

router.get(
  "/repos/:owner/:repo/current-sprint",
  requireAuth,
  getCurrentSprint
);

router.get(
  "/repos/:owner/:repo/issues",
  requireAuth,
  getOpenIssues
);

router.get(
  "/repos/:owner/:repo/pull-requests",
  requireAuth,
  getPullRequests
);

export default router;