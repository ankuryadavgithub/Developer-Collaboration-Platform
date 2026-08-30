import { simpleGit } from 'simple-git';
import fs from 'fs';
import path from 'path';

async function cloneAndCheck() {
  const git = simpleGit();
  const remoteUrl = `https://github.com/ankuryadavgithub/Developer-Collaboration-Platform.wiki.git`;
  const tempDir = path.join(process.cwd(), 'temp-wiki');
  
  if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
  
  try {
    await git.clone(remoteUrl, tempDir);
    console.log("Cloned successfully");
    console.log("Files:", fs.readdirSync(tempDir));
  } catch (err) {
    console.log("Error:", err.message);
  }
}

cloneAndCheck();
