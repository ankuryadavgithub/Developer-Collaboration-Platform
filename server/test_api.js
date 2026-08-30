import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testApi() {
  try {
    const orgId = 1;
    const workspaceId = 1;
    
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
        user: true,
      },
    });
    
    console.log("AVAILABLE FOR 1:", availableMembers.map(m => m.user.username));

    const availableMembers2 = await prisma.organizationMember.findMany({
      where: {
        organizationId: 2,
        user: {
          workspaceMembers: {
            none: { workspaceId: 2 },
          },
        },
      },
      include: {
        user: true,
      },
    });
    
    console.log("AVAILABLE FOR 2:", availableMembers2.map(m => m.user.username));

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}
testApi();
