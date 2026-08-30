import { simpleGit } from 'simple-git';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getAllMarkdownFiles = (dir, fileList = []) => {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === '.git') continue; 
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllMarkdownFiles(filePath, fileList);
    } else if (filePath.endsWith('.md')) {
      fileList.push(filePath);
    }
  }
  return fileList;
};

async function main() {
  // Let's get the workspace 1 repo
  const workspace = await prisma.workspace.findUnique({
    where: { id: 1 },
    include: { repository: true }
  });
  console.log("Workspace 1 repo:", workspace?.repository?.owner, workspace?.repository?.name);
  
  if (workspace && workspace.repository) {
    const { owner, name } = workspace.repository;
    // We don't have the user's token here easily, but we can try public clone if it's public
    // Let's just list the remote
    try {
      const git = simpleGit();
      const remoteUrl = `https://github.com/${owner}/${name}.wiki.git`;
      console.log("Checking remote:", remoteUrl);
      const remotes = await git.listRemote([remoteUrl]);
      console.log("Remote found! Length:", remotes.length);
    } catch(err) {
      console.log("Failed to list remote:", err.message);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
