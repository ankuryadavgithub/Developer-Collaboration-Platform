import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireWorkspaceMember } from "../middleware/workspace.middleware.js";
import {
  getWikiPages,
  getWikiPage,
  createWikiPage,
  updateWikiPage,
  deleteWikiPage,
  getWikiSyncStatus,
  fetchWikiFromGithub,
  pushWikiToGithub
} from "../controllers/wiki.controller.js";

const router = express.Router({ mergeParams: true });

router.use(requireAuth);
router.use(requireWorkspaceMember);

// GitHub Sync endpoints
router.get("/github/status", getWikiSyncStatus);
router.post("/github/fetch", fetchWikiFromGithub);
router.post("/github/push", pushWikiToGithub);

// Standard CRUD endpoints
router.get("/", getWikiPages);
router.post("/", createWikiPage);
router.get("/:pageId", getWikiPage);
router.put("/:pageId", updateWikiPage);
router.delete("/:pageId", deleteWikiPage);

export default router;
