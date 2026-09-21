import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const senderSelect = { id: true, username: true, avatar: true };

const workspaceUserIds = async (workspaceId, client = prisma) =>
  (await client.workspaceMember.findMany({ where: { workspaceId }, select: { userId: true } })).map((member) => member.userId);

export const ensureGeneralChannel = async (workspaceId, client = prisma) => {
  const channel = await client.channel.upsert({
    where: { workspaceId_name: { workspaceId, name: "general" } },
    update: { isDefaultAll: true },
    create: { workspaceId, name: "general", description: "Workspace-wide discussion", isDefaultAll: true },
  });
  const userIds = await workspaceUserIds(workspaceId, client);
  if (userIds.length) {
    await client.channelMember.createMany({
      data: userIds.map((userId) => ({ channelId: channel.id, userId })),
      skipDuplicates: true,
    });
  }
  return channel;
};

const channelForMember = (workspaceId, channelId, userId) =>
  prisma.channel.findFirst({ where: { id: channelId, workspaceId, members: { some: { userId } } } });

const parseChannelId = (value) => {
  const id = Number.parseInt(value, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const parseId = (value) => {
  const id = Number.parseInt(value, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const directConversationForMember = (workspaceId, conversationId, userId) =>
  prisma.directConversation.findFirst({
    where: { id: conversationId, workspaceId, participants: { some: { userId } } },
  });

const directConversationInclude = {
  participants: { include: { user: { select: senderSelect } } },
  messages: { include: { sender: { select: senderSelect } }, orderBy: { createdAt: "desc" }, take: 1 },
};

export const getChannels = async (req, res) => {
  try {
    const workspaceId = req.workspace.id;
    await ensureGeneralChannel(workspaceId);
    const channels = await prisma.channel.findMany({
      where: { workspaceId, members: { some: { userId: req.user.id } } },
      include: { _count: { select: { members: true } }, members: { select: { userId: true } } },
      orderBy: [{ name: "asc" }],
    });
    return res.status(200).json({ success: true, data: channels });
  } catch (error) {
    console.error("Get chat channels error:", error);
    return res.status(500).json({ success: false, message: "Failed to load channels." });
  }
};

export const createChannel = async (req, res) => {
  try {
    const workspaceId = req.workspace.id;
    const { name, description, memberIds } = req.body;
    if (typeof name !== "string") {
      return res.status(400).json({ success: false, message: "Channel name is required." });
    }
    const normalizedName = name.trim().toLowerCase().replace(/\s+/g, "-");
    if (!/^[a-z0-9][a-z0-9-]{0,48}$/.test(normalizedName)) {
      return res.status(400).json({ success: false, message: "Use 1–49 lowercase letters, numbers, or hyphens for the channel name." });
    }
    if (description !== undefined && (typeof description !== "string" || description.trim().length > 500)) {
      return res.status(400).json({ success: false, message: "Description must be 500 characters or less." });
    }
    if (memberIds !== undefined && (!Array.isArray(memberIds) || memberIds.some((id) => !Number.isInteger(Number(id))))) {
      return res.status(400).json({ success: false, message: "Invalid channel members." });
    }
    const workspaceMembers = await workspaceUserIds(workspaceId);
    const requested = memberIds === undefined ? workspaceMembers : [...new Set(memberIds.map(Number))];
    const selectedMembers = [...new Set([...requested, req.user.id])];
    if (selectedMembers.some((id) => !workspaceMembers.includes(id) && id !== req.user.id)) {
      return res.status(403).json({ success: false, message: "Channel members must belong to this workspace." });
    }
    const channel = await prisma.channel.create({
      data: {
        workspaceId,
        name: normalizedName,
        description: description?.trim() || null,
        isDefaultAll: memberIds === undefined,
        members: { create: selectedMembers.map((userId) => ({ userId })) },
      },
      include: { _count: { select: { members: true } }, members: { include: { user: { select: senderSelect } } } },
    });
    return res.status(201).json({ success: true, data: channel });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ success: false, message: "A channel with this name already exists." });
    }
    console.error("Create chat channel error:", error);
    return res.status(500).json({ success: false, message: "Failed to create channel." });
  }
};

export const getMessages = async (req, res) => {
  try {
    const workspaceId = req.workspace.id;
    const channelId = parseChannelId(req.params.channelId);
    if (!channelId) return res.status(400).json({ success: false, message: "Invalid channel." });
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 50, 1), 100);
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const channel = await channelForMember(workspaceId, channelId, req.user.id);
    if (!channel) return res.status(404).json({ success: false, message: "Channel not found." });
    const messages = await prisma.message.findMany({
      where: { channelId }, include: { sender: { select: senderSelect } },
      orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit + 1,
    });
    const hasMore = messages.length > limit;
    if (hasMore) messages.pop();
    return res.status(200).json({ success: true, data: messages.reverse(), pagination: { page, limit, hasMore } });
  } catch (error) {
    console.error("Get chat messages error:", error);
    return res.status(500).json({ success: false, message: "Failed to load messages." });
  }
};

export const createMessage = async (req, res) => {
  try {
    const message = await saveMessage({
      workspaceId: req.workspace.id,
      channelId: req.params.channelId,
      senderId: req.user.id,
      content: req.body.content,
    });
    req.app.get("io")?.to(`channel:${message.channelId}`).emit("message:new", message);
    return res.status(201).json({ success: true, data: message });
  } catch (error) {
    const status = error.status || 500;
    if (status === 500) console.error("Create chat message error:", error);
    return res.status(status).json({ success: false, message: error.message || "Failed to send message." });
  }
};

export const saveMessage = async ({ workspaceId, channelId, senderId, content }) => {
  const id = parseChannelId(channelId);
  if (!id) throw Object.assign(new Error("Invalid channel."), { status: 400 });
  if (typeof content !== "string" || !content.trim()) throw Object.assign(new Error("Message cannot be empty."), { status: 400 });
  const trimmed = content.trim();
  if (trimmed.length > 4000) throw Object.assign(new Error("Messages are limited to 4,000 characters."), { status: 400 });
  const channel = await channelForMember(workspaceId, id, senderId);
  if (!channel) throw Object.assign(new Error("Channel not found."), { status: 404 });
  return prisma.message.create({ data: { channelId: id, senderId, content: trimmed }, include: { sender: { select: senderSelect } } });
};

export const getDirectConversations = async (req, res) => {
  try {
    const conversations = await prisma.directConversation.findMany({
      where: { workspaceId: req.workspace.id, participants: { some: { userId: req.user.id } } },
      include: directConversationInclude,
      orderBy: { updatedAt: "desc" },
    });
    return res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    console.error("Get direct conversations error:", error);
    return res.status(500).json({ success: false, message: "Failed to load direct conversations." });
  }
};

export const openDirectConversation = async (req, res) => {
  try {
    const recipientId = parseId(req.params.userId);
    if (!recipientId || recipientId === req.user.id) {
      return res.status(400).json({ success: false, message: "Choose another workspace member." });
    }
    const recipient = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: req.workspace.id, userId: recipientId } },
    });
    if (!recipient) return res.status(404).json({ success: false, message: "Workspace member not found." });
    const directKey = [req.user.id, recipientId].sort((a, b) => a - b).join(":");
    const conversation = await prisma.directConversation.upsert({
      where: { workspaceId_directKey: { workspaceId: req.workspace.id, directKey } },
      update: {},
      create: {
        workspaceId: req.workspace.id,
        directKey,
        participants: { create: [{ userId: req.user.id }, { userId: recipientId }] },
      },
      include: directConversationInclude,
    });
    return res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    console.error("Open direct conversation error:", error);
    return res.status(500).json({ success: false, message: "Failed to open direct conversation." });
  }
};

export const getDirectMessages = async (req, res) => {
  try {
    const conversationId = parseId(req.params.conversationId);
    if (!conversationId) return res.status(400).json({ success: false, message: "Invalid conversation." });
    const conversation = await directConversationForMember(req.workspace.id, conversationId, req.user.id);
    if (!conversation) return res.status(404).json({ success: false, message: "Conversation not found." });
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 50, 1), 100);
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const messages = await prisma.directMessage.findMany({
      where: { conversationId }, include: { sender: { select: senderSelect } },
      orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit + 1,
    });
    const hasMore = messages.length > limit;
    if (hasMore) messages.pop();
    return res.status(200).json({ success: true, data: messages.reverse(), pagination: { page, limit, hasMore } });
  } catch (error) {
    console.error("Get direct messages error:", error);
    return res.status(500).json({ success: false, message: "Failed to load direct messages." });
  }
};

export const createDirectMessage = async (req, res) => {
  try {
    const message = await saveDirectMessage({
      workspaceId: req.workspace.id,
      conversationId: req.params.conversationId,
      senderId: req.user.id,
      content: req.body.content,
    });
    req.app.get("io")?.to(`direct:${message.conversationId}`).emit("direct:message:new", message);
    return res.status(201).json({ success: true, data: message });
  } catch (error) {
    const status = error.status || 500;
    if (status === 500) console.error("Create direct message error:", error);
    return res.status(status).json({ success: false, message: error.message || "Failed to send message." });
  }
};

export const saveDirectMessage = async ({ workspaceId, conversationId, senderId, content }) => {
  const id = parseId(conversationId);
  if (!id) throw Object.assign(new Error("Invalid conversation."), { status: 400 });
  if (typeof content !== "string" || !content.trim()) throw Object.assign(new Error("Message cannot be empty."), { status: 400 });
  const trimmed = content.trim();
  if (trimmed.length > 4000) throw Object.assign(new Error("Messages are limited to 4,000 characters."), { status: 400 });
  const conversation = await directConversationForMember(workspaceId, id, senderId);
  if (!conversation) throw Object.assign(new Error("Conversation not found."), { status: 404 });
  const message = await prisma.directMessage.create({
    data: { conversationId: id, senderId, content: trimmed },
    include: { sender: { select: senderSelect } },
  });
  await prisma.directConversation.update({ where: { id }, data: { updatedAt: new Date() } });
  return message;
};
