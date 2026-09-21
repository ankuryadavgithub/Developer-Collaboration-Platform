import jwt from "jsonwebtoken";
import cookie from "cookie";
import { PrismaClient } from "@prisma/client";
import { saveDirectMessage, saveMessage } from "../controllers/chat.controller.js";

const prisma = new PrismaClient();

const workspaceAccess = async (userId, workspaceId) => {
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace) return false;
  const orgMember = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId: workspace.organizationId, userId } },
  });
  if (!orgMember) return false;
  if (["OWNER", "ADMIN"].includes(orgMember.role)) return true;
  return Boolean(await prisma.workspaceMember.findUnique({ where: { workspaceId_userId: { workspaceId, userId } } }));
};

export const configureSocketServer = (io) => {
  io.use((socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || "");
      const token = cookies.accessToken;
      if (!token) return next(new Error("Authentication required."));
      const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      socket.user = { id: user.id, username: user.username };
      return next();
    } catch {
      return next(new Error("Invalid or expired session."));
    }
  });

  io.on("connection", (socket) => {
    socket.on("channel:join", async ({ workspaceId, channelId }, acknowledge = () => {}) => {
      const parsedWorkspaceId = Number.parseInt(workspaceId, 10);
      const parsedChannelId = Number.parseInt(channelId, 10);
      if (!Number.isInteger(parsedWorkspaceId) || !Number.isInteger(parsedChannelId) || !(await workspaceAccess(socket.user.id, parsedWorkspaceId))) {
        return acknowledge({ ok: false, message: "You do not have access to this channel." });
      }
      const channel = await prisma.channel.findFirst({
        where: { id: parsedChannelId, workspaceId: parsedWorkspaceId, members: { some: { userId: socket.user.id } } },
      });
      if (!channel) return acknowledge({ ok: false, message: "Channel not found." });
      for (const room of socket.rooms) if (room.startsWith("channel:")) socket.leave(room);
      socket.join(`workspace:${parsedWorkspaceId}`);
      socket.join(`channel:${parsedChannelId}`);
      return acknowledge({ ok: true });
    });

    socket.on("channel:leave", ({ channelId }) => socket.leave(`channel:${Number.parseInt(channelId, 10)}`));

    socket.on("direct:join", async ({ workspaceId, conversationId }, acknowledge = () => {}) => {
      const parsedWorkspaceId = Number.parseInt(workspaceId, 10);
      const parsedConversationId = Number.parseInt(conversationId, 10);
      if (!Number.isInteger(parsedWorkspaceId) || !Number.isInteger(parsedConversationId) || !(await workspaceAccess(socket.user.id, parsedWorkspaceId))) {
        return acknowledge({ ok: false, message: "You do not have access to this conversation." });
      }
      const conversation = await prisma.directConversation.findFirst({
        where: { id: parsedConversationId, workspaceId: parsedWorkspaceId, participants: { some: { userId: socket.user.id } } },
      });
      if (!conversation) return acknowledge({ ok: false, message: "Conversation not found." });
      socket.join(`direct:${parsedConversationId}`);
      return acknowledge({ ok: true });
    });

    socket.on("direct:leave", ({ conversationId }) => socket.leave(`direct:${Number.parseInt(conversationId, 10)}`));

    socket.on("message:send", async ({ workspaceId, channelId, content }, acknowledge = () => {}) => {
      try {
        const parsedWorkspaceId = Number.parseInt(workspaceId, 10);
        if (!Number.isInteger(parsedWorkspaceId) || !(await workspaceAccess(socket.user.id, parsedWorkspaceId))) {
          return acknowledge({ ok: false, message: "You do not have access to this workspace." });
        }
        const message = await saveMessage({ workspaceId: parsedWorkspaceId, channelId, senderId: socket.user.id, content });
        io.to(`channel:${message.channelId}`).emit("message:new", message);
        return acknowledge({ ok: true, message });
      } catch (error) {
        return acknowledge({ ok: false, message: error.message || "Unable to send message." });
      }
    });

    socket.on("direct:message:send", async ({ workspaceId, conversationId, content }, acknowledge = () => {}) => {
      try {
        const parsedWorkspaceId = Number.parseInt(workspaceId, 10);
        if (!Number.isInteger(parsedWorkspaceId) || !(await workspaceAccess(socket.user.id, parsedWorkspaceId))) {
          return acknowledge({ ok: false, message: "You do not have access to this workspace." });
        }
        const message = await saveDirectMessage({ workspaceId: parsedWorkspaceId, conversationId, senderId: socket.user.id, content });
        io.to(`direct:${message.conversationId}`).emit("direct:message:new", message);
        return acknowledge({ ok: true, message });
      } catch (error) {
        return acknowledge({ ok: false, message: error.message || "Unable to send message." });
      }
    });
  });
};
