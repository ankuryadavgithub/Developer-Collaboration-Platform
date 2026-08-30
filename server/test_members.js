import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  const orgId = 1; // Assuming orgId 1, we will see
  const workspaceId = 1; // Assuming workspaceId 1

  const availableMembers = await prisma.organizationMember.findMany({
    where: {
      organizationId: orgId,
      user: {
        workspaceMembers: {
          none: { workspaceId: workspaceId },
        },
      },
    },
    include: {
      user: {
        select: { id: true, username: true, email: true },
      },
    },
  });

  console.log("Available members for org 1, workspace 1:", JSON.stringify(availableMembers, null, 2));
  
  const currentMembers = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: { select: { id: true, username: true, email: true } },
      },
    });
  console.log("Current members for workspace 1:", JSON.stringify(currentMembers, null, 2));

  // Let's also check org 1, workspace 2 just in case
  const w2 = 2;
  const currentMembers2 = await prisma.workspaceMember.findMany({
      where: { workspaceId: w2 },
      include: {
        user: { select: { id: true, username: true, email: true } },
      },
    });
  console.log("Current members for workspace 2:", JSON.stringify(currentMembers2, null, 2));
  
  const availableMembers2 = await prisma.organizationMember.findMany({
    where: {
      organizationId: 1, // assuming test_101 is in org 1
      user: {
        workspaceMembers: {
          none: { workspaceId: w2 },
        },
      },
    },
    include: {
      user: {
        select: { id: true, username: true, email: true },
      },
    },
  });

  console.log("Available members for org 1, workspace 2:", JSON.stringify(availableMembers2, null, 2));
}

test().catch(console.error).finally(() => prisma.$disconnect());
