import { PrismaClient } from "@prisma/client";
import { simpleGit } from 'simple-git';
import fs from 'fs';
import path from 'path';
import os from 'os';

const prisma = new PrismaClient();

// Helper: Recursively get all .md files in a directory
const getAllMarkdownFiles = (dir, fileList = []) => {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === '.git') continue; // Skip git internals
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllMarkdownFiles(filePath, fileList);
    } else if (filePath.endsWith('.md')) {
      fileList.push(filePath);
    }
  }
  return fileList;
};

// Helper: Sanitize title for safe file system usage
const sanitizeFilename = (title) => {
  return title.replace(/[\/\\?%*:|"<>]/g, '-');
};

// Get all wiki pages for a workspace (lightweight list)
export const getWikiPages = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const pages = await prisma.wikiPage.findMany({
      where: { workspaceId: parseInt(workspaceId) },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        createdById: true,
        isDraft: true,
        lastSyncedAt: true
      },
      orderBy: { updatedAt: "desc" },
    });
    res.json({ success: true, data: pages });
  } catch (error) {
    console.error("Error fetching wiki pages:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get a single wiki page (with content)
export const getWikiPage = async (req, res) => {
  try {
    const { workspaceId, pageId } = req.params;
    const page = await prisma.wikiPage.findFirst({
      where: {
        id: parseInt(pageId),
        workspaceId: parseInt(workspaceId),
      },
    });

    if (!page) {
      return res.status(404).json({ success: false, message: "Wiki page not found" });
    }

    res.json({ success: true, data: page });
  } catch (error) {
    console.error("Error fetching wiki page:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Create a new wiki page
export const createWikiPage = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { title, content } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const existing = await prisma.wikiPage.findUnique({
      where: {
        workspaceId_title: {
          workspaceId: parseInt(workspaceId),
          title,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ success: false, message: "A page with this title already exists" });
    }

    const newPage = await prisma.wikiPage.create({
      data: {
        title,
        content: content || "",
        workspaceId: parseInt(workspaceId),
        createdById: req.user.id,
        isDraft: true // Marked as draft because it hasn't been pushed yet
      },
    });

    res.status(201).json({ success: true, data: newPage });
  } catch (error) {
    console.error("Error creating wiki page:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update an existing wiki page
export const updateWikiPage = async (req, res) => {
  try {
    const { workspaceId, pageId } = req.params;
    const { title, content } = req.body;

    const page = await prisma.wikiPage.findFirst({
      where: { id: parseInt(pageId), workspaceId: parseInt(workspaceId) },
    });

    if (!page) {
      return res.status(404).json({ success: false, message: "Wiki page not found" });
    }

    const updatedPage = await prisma.wikiPage.update({
      where: { id: parseInt(pageId) },
      data: {
        title: title || page.title,
        content: content !== undefined ? content : page.content,
        isDraft: true // Marked as draft upon editing
      },
    });

    res.json({ success: true, data: updatedPage });
  } catch (error) {
    console.error("Error updating wiki page:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Delete a wiki page
export const deleteWikiPage = async (req, res) => {
  try {
    const { workspaceId, pageId } = req.params;

    const page = await prisma.wikiPage.findFirst({
      where: { id: parseInt(pageId), workspaceId: parseInt(workspaceId) },
    });

    if (!page) {
      return res.status(404).json({ success: false, message: "Wiki page not found" });
    }

    await prisma.wikiPage.delete({
      where: { id: parseInt(pageId) },
    });

    res.json({ success: true, message: "Wiki page deleted successfully" });
  } catch (error) {
    console.error("Error deleting wiki page:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// --- PHASE 2: GitHub Sync Controllers ---

export const getWikiSyncStatus = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    
    const workspace = await prisma.workspace.findUnique({
      where: { id: parseInt(workspaceId) },
      include: { repository: true }
    });
    
    if (!workspace || !workspace.repository) {
      return res.json({ success: true, hasWiki: false, error: "No repository connected" });
    }
    
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || !user.githubAccessToken) {
      return res.json({ success: true, hasWiki: false, error: "No GitHub Token" });
    }
    
    const { owner, name } = workspace.repository;
    const token = user.githubAccessToken;
    
    const git = simpleGit();
    const remoteUrl = `https://${token}@github.com/${owner}/${name}.wiki.git`;
    
    try {
      await git.listRemote([remoteUrl]);
      res.json({ success: true, hasWiki: true, repoOwner: owner, repoName: name });
    } catch (gitError) {
      res.json({ success: true, hasWiki: false, repoOwner: owner, repoName: name });
    }
  } catch (error) {
    console.error("Error checking wiki status:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const fetchWikiFromGithub = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    
    const workspace = await prisma.workspace.findUnique({
      where: { id: parseInt(workspaceId) },
      include: { repository: true }
    });
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    
    if (!workspace?.repository || !user?.githubAccessToken) {
      return res.status(400).json({ success: false, message: "Missing repository or GitHub access token." });
    }
    
    const { owner, name } = workspace.repository;
    const remoteUrl = `https://${user.githubAccessToken}@github.com/${owner}/${name}.wiki.git`;
    
    const tempDir = path.join(os.tmpdir(), `wiki-sync-${workspaceId}-${Date.now()}`);
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    
    const git = simpleGit();
    
    try {
      await git.clone(remoteUrl, tempDir);
      
      // Fix #5: Recursively fetch nested folders
      const mdFiles = getAllMarkdownFiles(tempDir);
      const processedGithubPaths = [];
      
      for (const fullPath of mdFiles) {
        // Keep slashes standardized for githubPath
        const relPath = path.relative(tempDir, fullPath).replace(/\\/g, '/'); 
        processedGithubPaths.push(relPath);
        
        // Use relative path minus extension for title to ensure uniqueness in nested folders
        const title = relPath.replace(/\.md$/, ''); 
        const content = fs.readFileSync(fullPath, 'utf8');
        
        await prisma.wikiPage.upsert({
          where: {
            workspaceId_title: {
              workspaceId: parseInt(workspaceId),
              title: title
            }
          },
          update: {
            content: content,
            githubPath: relPath,
            lastSyncedAt: new Date(),
            isDraft: false
          },
          create: {
            workspaceId: parseInt(workspaceId),
            title: title,
            content: content,
            githubPath: relPath,
            lastSyncedAt: new Date(),
            isDraft: false,
            createdById: req.user.id
          }
        });
      }
      
      // Fix #1 (Part 1) & #6: Deletion Sync. Delete pages from DB that are gone from GitHub.
      // We ONLY delete pages that were already synced (isDraft: false).
      // We protect unsynced local drafts from being wiped.
      if (processedGithubPaths.length > 0) {
        await prisma.wikiPage.deleteMany({
          where: {
            workspaceId: parseInt(workspaceId),
            isDraft: false, // only delete previously synced pages
            githubPath: {
              notIn: processedGithubPaths
            }
          }
        });
      }
      
      fs.rmSync(tempDir, { recursive: true, force: true });
      res.json({ success: true, message: "Successfully fetched from GitHub wiki." });
    } catch (gitErr) {
      console.error(gitErr);
      if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
      res.status(400).json({ success: false, message: "Failed to fetch from GitHub Wiki. It may not exist yet." });
    }
  } catch (error) {
    console.error("Error fetching wiki:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const pushWikiToGithub = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    
    const workspace = await prisma.workspace.findUnique({
      where: { id: parseInt(workspaceId) },
      include: { repository: true }
    });
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    
    if (!workspace?.repository || !user?.githubAccessToken) {
      return res.status(400).json({ success: false, message: "Missing repository or GitHub token." });
    }
    
    const pages = await prisma.wikiPage.findMany({
      where: { workspaceId: parseInt(workspaceId) }
    });
    
    const { owner, name } = workspace.repository;
    const remoteUrl = `https://${user.githubAccessToken}@github.com/${owner}/${name}.wiki.git`;
    
    const tempDir = path.join(os.tmpdir(), `wiki-sync-${workspaceId}-${Date.now()}`);
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    
    const git = simpleGit();
    
    try {
      try {
        await git.clone(remoteUrl, tempDir);
      } catch (err) {
        // Init empty repo if clone fails
        const localGit = simpleGit(tempDir);
        await localGit.init();
        await localGit.addRemote('origin', remoteUrl);
      }
      
      const localGit = simpleGit(tempDir);
      await localGit.addConfig('user.name', user.username || 'Dev Collaboration Platform');
      await localGit.addConfig('user.email', user.email);
      
      // Fix #1 (Part 2) & #4: Wipe existing .md files so Git detects deletions and renames
      const existingFiles = getAllMarkdownFiles(tempDir);
      existingFiles.forEach(file => fs.unlinkSync(file));
      
      // Write current DB pages
      for (const page of pages) {
        // Fix #2: Sanitize titles if they don't have a githubPath yet
        const relPath = page.githubPath || `${sanitizeFilename(page.title)}.md`;
        const fullPath = path.join(tempDir, relPath);
        
        // Ensure any subdirectories exist before writing (e.g., if relPath is "Backend/Setup.md")
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        
        fs.writeFileSync(fullPath, page.content || "");
        
        // If it was a new page, save the new githubPath back to DB
        if (!page.githubPath) {
           await prisma.wikiPage.update({
             where: { id: page.id },
             data: { githubPath: relPath }
           });
        }
      }
      
      await localGit.add('./*');
      const status = await localGit.status();
      
      if (status.files.length > 0) {
        await localGit.commit('Updated wiki from Developer Collaboration Platform');
        await localGit.push('origin', 'HEAD:master', { '--force': null }); 
      }
      
      // Update DB to mark as synced
      await prisma.wikiPage.updateMany({
        where: { workspaceId: parseInt(workspaceId) },
        data: {
          lastSyncedAt: new Date(),
          isDraft: false
        }
      });
      
      fs.rmSync(tempDir, { recursive: true, force: true });
      res.json({ success: true, message: "Successfully pushed to GitHub wiki." });
    } catch (gitErr) {
      console.error(gitErr);
      if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
      res.status(500).json({ success: false, message: "Failed to push to GitHub Wiki." });
    }
  } catch (error) {
    console.error("Error pushing wiki:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
