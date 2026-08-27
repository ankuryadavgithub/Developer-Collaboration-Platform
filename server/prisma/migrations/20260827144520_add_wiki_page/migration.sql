-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "githubProjectId" TEXT;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "githubIssueId" TEXT,
ADD COLUMN     "githubIssueNum" INTEGER,
ADD COLUMN     "githubItemId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "githubUsername" TEXT;

-- CreateTable
CREATE TABLE "WikiPage" (
    "id" SERIAL NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WikiPage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WikiPage_workspaceId_title_key" ON "WikiPage"("workspaceId", "title");

-- AddForeignKey
ALTER TABLE "WikiPage" ADD CONSTRAINT "WikiPage_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WikiPage" ADD CONSTRAINT "WikiPage_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
