// server/src/controllers/user.controller.js

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const prisma = new PrismaClient();

// @desc    Get current user profile
// @route   GET /api/users/me
export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      // Select only what is needed, exclude the password!
      select: {
        id: true,
        username: true,
        email: true,
        jobTitle: true,
        avatar: true,
        githubId: true,
        googleId: true
      }
    });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update profile (General Tab)
// @route   PATCH /api/users/me
export const updateProfile = async (req, res) => {
  try {
    const { username, jobTitle, avatar } = req.body;
    
    // Validate if the new username is already taken by someone else
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: { username, id: { not: req.user.id } }
      });
      if (existingUser) {
        return res.status(400).json({ success: false, message: "Username is already taken" });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { username, jobTitle, avatar },
      select: { id: true, username: true, email: true, jobTitle: true, avatar: true }
    });

    return res.status(200).json({ success: true, data: updatedUser, message: "Profile updated successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update password (Security Tab)
// @route   PATCH /api/users/me/password
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Edge Case: User signed up with Google/GitHub and doesn't have a password
    if (!user.password) {
      return res.status(400).json({ success: false, message: "You signed in with an external provider and do not have a password." });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Incorrect current password" });

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    return res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Link Google Account
// @route   POST /api/users/me/google
export const linkGoogle = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ success: false, message: "Google credential is required" });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { sub } = ticket.getPayload();

    const existing = await prisma.user.findFirst({ where: { googleId: sub, id: { not: req.user.id } } });
    if (existing) return res.status(400).json({ success: false, message: "This Google account is already linked to another user." });

    await prisma.user.update({
      where: { id: req.user.id },
      data: { googleId: sub }
    });

    return res.status(200).json({ success: true, message: "Google account linked successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to link Google account" });
  }
};

// @desc    Unlink Google Account
// @route   DELETE /api/users/me/google
export const unlinkGoogle = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    
    // Safety check: Prevent users from locking themselves out!
    if (!user.password && !user.githubId) {
      return res.status(400).json({ success: false, message: "Cannot unlink Google. You must have a password or another linked account to log in." });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { googleId: null }
    });

    return res.status(200).json({ success: true, message: "Google account unlinked successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to unlink Google account" });
  }
};

// @desc    Unlink GitHub Account
// @route   DELETE /api/users/me/github
export const unlinkGithub = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    
    // Safety check: Prevent users from locking themselves out!
    if (!user.password && !user.googleId) {
      return res.status(400).json({ success: false, message: "Cannot unlink GitHub. You must have a password or another linked account to log in." });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { githubId: null, githubAccessToken: null }
    });

    return res.status(200).json({ success: true, message: "GitHub account unlinked successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to unlink GitHub account" });
  }
};