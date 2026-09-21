import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireWorkspaceMember, requireWorkspaceManager } from "../middleware/workspace.middleware.js";
import { createChannel, createDirectMessage, createMessage, getChannels, getDirectConversations, getDirectMessages, getMessages, openDirectConversation } from "../controllers/chat.controller.js";

const router = express.Router({ mergeParams: true });
router.get("/channels", requireAuth, requireWorkspaceMember, getChannels);
router.post("/channels", requireAuth, requireWorkspaceManager, createChannel);
router.get("/channels/:channelId/messages", requireAuth, requireWorkspaceMember, getMessages);
router.post("/channels/:channelId/messages", requireAuth, requireWorkspaceMember, createMessage);
router.get("/direct", requireAuth, requireWorkspaceMember, getDirectConversations);
router.post("/direct/:userId", requireAuth, requireWorkspaceMember, openDirectConversation);
router.get("/direct/:conversationId/messages", requireAuth, requireWorkspaceMember, getDirectMessages);
router.post("/direct/:conversationId/messages", requireAuth, requireWorkspaceMember, createDirectMessage);
export default router;
