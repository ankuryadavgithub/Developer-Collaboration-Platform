-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profileCompleted" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "role" DROP NOT NULL;
