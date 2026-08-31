-- AlterTable
ALTER TABLE "WikiPage" ADD COLUMN     "githubPath" TEXT,
ADD COLUMN     "isDraft" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastSyncedAt" TIMESTAMP(3);
