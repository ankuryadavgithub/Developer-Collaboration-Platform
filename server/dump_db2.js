import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const allWorkspaces = await prisma.workspace.findMany();
  console.log('Workspaces:', allWorkspaces);
  
  const allOrgMembers = await prisma.organizationMember.findMany({ include: { user: true }});
  console.log('Org Members:', allOrgMembers.map(m => ({ org: m.organizationId, user: m.user.username })));
  
  const allWorkspaceMembers = await prisma.workspaceMember.findMany({ include: { user: true }});
  console.log('Workspace Members:', allWorkspaceMembers.map(m => ({ ws: m.workspaceId, user: m.user.username })));
}
run().finally(() => prisma.$disconnect());
