import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const allOrgMembers = await prisma.organizationMember.findMany();
  console.log('All Org Members:', allOrgMembers);
  const allWorkspaceMembers = await prisma.workspaceMember.findMany();
  console.log('All Workspace Members:', allWorkspaceMembers);
}
run().finally(() => prisma.$disconnect());
