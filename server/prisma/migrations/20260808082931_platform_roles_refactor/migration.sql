-- 1. Create the Organization Table
CREATE TABLE "Organization" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ownerId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- 2. Create the OrganizationRole Enum
CREATE TYPE "OrganizationRole" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'MEMBER');

-- 3. Create the OrganizationMember Table
CREATE TABLE "OrganizationMember" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" "OrganizationRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

-- 4. Create new PlatformRole Enum
CREATE TYPE "PlatformRole_new" AS ENUM ('PLATFORM_ADMIN', 'USER');

-- 5. Rename column first, then apply the new Enum
ALTER TABLE "User" RENAME COLUMN "role" TO "platformRole";
ALTER TABLE "User" ALTER COLUMN "platformRole" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "platformRole" TYPE "PlatformRole_new" USING (
  CASE 
    WHEN "platformRole"::text = 'ADMIN' THEN 'PLATFORM_ADMIN'::text
    ELSE 'USER'::text
  END
)::"PlatformRole_new";

-- 6. Clean up old enum
ALTER TYPE "PlatformRole" RENAME TO "PlatformRole_old";
ALTER TYPE "PlatformRole_new" RENAME TO "PlatformRole";
DROP TYPE "PlatformRole_old";

-- 7. Add default back
ALTER TABLE "User" ALTER COLUMN "platformRole" SET DEFAULT 'USER';

-- 8. Add Constraints
CREATE UNIQUE INDEX "OrganizationMember_organizationId_userId_key" ON "OrganizationMember"("organizationId", "userId");
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;