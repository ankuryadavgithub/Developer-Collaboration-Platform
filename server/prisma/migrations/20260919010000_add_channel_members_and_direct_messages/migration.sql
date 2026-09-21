ALTER TABLE "Channel" ADD COLUMN "isDefaultAll" BOOLEAN NOT NULL DEFAULT false;
UPDATE "Channel" SET "isDefaultAll" = true WHERE "name" = 'general';

CREATE TABLE "ChannelMember" (
  "channelId" INTEGER NOT NULL,
  "userId" INTEGER NOT NULL,
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ChannelMember_pkey" PRIMARY KEY ("channelId", "userId")
);
CREATE TABLE "DirectConversation" (
  "id" SERIAL NOT NULL,
  "workspaceId" INTEGER NOT NULL,
  "directKey" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DirectConversation_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "DirectParticipant" (
  "conversationId" INTEGER NOT NULL,
  "userId" INTEGER NOT NULL,
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DirectParticipant_pkey" PRIMARY KEY ("conversationId", "userId")
);
CREATE TABLE "DirectMessage" (
  "id" SERIAL NOT NULL,
  "conversationId" INTEGER NOT NULL,
  "senderId" INTEGER NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DirectMessage_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ChannelMember_userId_idx" ON "ChannelMember"("userId");
CREATE UNIQUE INDEX "DirectConversation_workspaceId_directKey_key" ON "DirectConversation"("workspaceId", "directKey");
CREATE INDEX "DirectConversation_workspaceId_idx" ON "DirectConversation"("workspaceId");
CREATE INDEX "DirectParticipant_userId_idx" ON "DirectParticipant"("userId");
CREATE INDEX "DirectMessage_conversationId_createdAt_idx" ON "DirectMessage"("conversationId", "createdAt");
ALTER TABLE "ChannelMember" ADD CONSTRAINT "ChannelMember_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChannelMember" ADD CONSTRAINT "ChannelMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DirectConversation" ADD CONSTRAINT "DirectConversation_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DirectParticipant" ADD CONSTRAINT "DirectParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "DirectConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DirectParticipant" ADD CONSTRAINT "DirectParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "DirectConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Existing channels remain open to everyone in their workspace by default.
INSERT INTO "ChannelMember" ("channelId", "userId")
SELECT c."id", wm."userId" FROM "Channel" c JOIN "WorkspaceMember" wm ON wm."workspaceId" = c."workspaceId"
ON CONFLICT DO NOTHING;
