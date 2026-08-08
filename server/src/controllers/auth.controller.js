import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import {
  generateAccessToken,
  generateRefreshToken,
  generateTemporaryToken,
} from "../utils/token.utils.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";

const prisma = new PrismaClient({});

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
);

export const registerUser = async(req,res) => {
  try {
    const { username, email, jobTitle, password } = req.body;

    if (!username || !email || !jobTitle || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    if (username.length < 3 || username.includes(" ")) {
      return res.status(400).json({
        success: false,
        message:
          "Username must be at least 3 characters and contain no spaces.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long, and include at least one number and one special character.",
      });
    }

    const validJobTitles = [
      "project_manager",
      "developer",
      "frontend_developer",
      "backend_developer",
      "fullstack_developer",
    ];
    if (!validJobTitles.includes(jobTitle)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid job title selected." });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "A user with this email or username already exists.",
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        jobTitle,
        password: hashedPassword,
        profileCompleted: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully!",
      data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        jobTitle: newUser.jobTitle,
        platformRole: newUser.platformRole,
      },
    });
  } catch (error) {
    console.error("Database error during signup:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, password, turnstileToken } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required.",
      });
    }

    if (!turnstileToken) {
      return res.status(400).json({
        success: false,
        message: "CAPTCHA token is missing.",
      });
    }

    const formData = new URLSearchParams();
    formData.append("secret", process.env.TURNSTILE_SECRET_KEY);
    formData.append("response", turnstileToken);

    const verficationResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      },
    );

    const verficationData = await verficationResponse.json();

    if (!verficationData.success) {
      return res.status(403).json({
        success: false,
        message: "CAPTCHA validation failed. Please try again.",
      });
    }
    const user = await prisma.user.findFirst({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    };

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 24 * 60 * 60 * 1000,
    }); // 1 Day
    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 10 * 24 * 60 * 60 * 1000,
    }); // 10 Days

    res.clearCookie("github_access_token", cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Login Successful!",
      accessToken,
      refreshToken,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        jobTitle: user.jobTitle,
        platformRole: user.platformRole,
      },
    });
  } catch (error) {
    console.error("Database Error during Login:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ success: false, message: "Google credential is required." });

    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
    const { email, picture, sub } = ticket.getPayload();

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Brand new account via Google
      user = await prisma.user.create({
        data: {
          email,
          googleId: sub,
          avatar: picture,
          profileCompleted: false
        }
      });
    } else {
      // Account exists! Update the avatar to Google's so they look like a Google user this session.
      user = await prisma.user.update({
        where: { id: user.id },
        data: { avatar: picture, googleId: sub }
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    };

    res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 24 * 60 * 60 * 1000 });
    res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 10 * 24 * 60 * 60 * 1000 });
    res.clearCookie("github_access_token", cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Google Login Successful",
      profileCompleted: user.profileCompleted,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        jobTitle: user.jobTitle,
        avatar: user.avatar,
        platformRole: user.platformRole,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Google Login Failed" });
  }
};

export const completeProfile = async (req, res) => {
  try {
    const username = req.body.username?.trim();
    const { jobTitle } = req.body;

    if (!username || !jobTitle) {
      return res.status(400).json({
        success: false,
        message: "Username and job title are required.",
      });
    }

    if (username.length < 3 || username.includes(" ")) {
      return res.status(400).json({
        success: false,
        message: "Username must be at least 3 characters and contain no spaces.",
      });
    }

    const validJobTitles = [
      "project_manager",
      "developer",
      "frontend_developer",
      "backend_developer",
      "fullstack_developer",
    ];

    if (!validJobTitles.includes(jobTitle)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job title selected.",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser && existingUser.id !== req.user.id) {
      return res.status(409).json({
        success: false,
        message: "This username is already taken.",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        username,
        jobTitle,
        profileCompleted: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Profile completed successfully.",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        jobTitle: updatedUser.jobTitle,
        avatar: updatedUser.avatar,
        profileCompleted: updatedUser.profileCompleted,
        platformRole: updatedUser.platformRole,
      },
    });
  } catch (error) {
    console.error("Profile completion error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not complete your profile.",
    });
  }
};

export const githubLogin = (req, res) => {
  const { action } = req.query; 
  const state = crypto.randomBytes(32).toString("hex");

  res.cookie("github_oauth_state", JSON.stringify({ state, action }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 10 * 60 * 1000,
  });

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: `http://localhost:5000/api/auth/github/callback`,
    scope: "read:user user:email public_repo",
    state,
    prompt: "select_account" // <--- THIS IS THE MAGIC FIX
  });

  return res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
};


export const githubCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    const savedCookie = req.cookies.github_oauth_state;
    const { state: savedState, action } = savedCookie ? JSON.parse(savedCookie) : {};
    res.clearCookie("github_oauth_state");

    if (!code || !state || state !== savedState) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=github_auth_failed`);
    }

    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: "http://localhost:5000/api/auth/github/callback",
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) return res.redirect(`${process.env.CLIENT_URL}/login?error=github_auth_failed`);

    const githubToken = tokenData.access_token;
    const githubUserResponse = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    });
    const githubUser = await githubUserResponse.json();

    // ==========================================
    // ACTION: CONNECTING FROM DASHBOARD
    // ==========================================
    if (action === "connect") {
       const currentToken = req.cookies.token || req.cookies.accessToken;
       if (currentToken) {
         try {
           const decoded = jwt.verify(currentToken, process.env.JWT_SECRET);
           // Link the GitHub account in DB, but DO NOT change the Google avatar!
           await prisma.user.update({
             where: { id: decoded.id },
             data: {
               githubId: String(githubUser.id),
               githubAccessToken: githubToken
             }
           });
         } catch (err) {}
       }
       return res.redirect(`${process.env.CLIENT_URL}/dashboard`); 
    }

    // ==========================================
    // ACTION: GITHUB LOGIN/SIGNUP
    // ==========================================
    const emailsResponse = await fetch("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    });

    const emails = await emailsResponse.json();
    const verifiedEmail = Array.isArray(emails) ? emails.find((item) => item.primary && item.verified)?.email : null;

    if (!verifiedEmail) return res.redirect(`${process.env.CLIENT_URL}/login?error=github_email_required`);

    // Look for existing user by Github ID OR Email (so they share the same account)
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { githubId: String(githubUser.id) },
          { email: verifiedEmail }, 
        ],
      },
    });

    if (!user) {
      // Brand new GitHub account
      user = await prisma.user.create({
        data: {
          email: verifiedEmail,
          githubId: String(githubUser.id),
          githubAccessToken: githubToken,
          avatar: githubUser.avatar_url,
          profileCompleted: false, 
        },
      });
    } else {
      // Auto-link: Update their avatar to GitHub since they chose to log in via GitHub today!
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          avatar: githubUser.avatar_url,
          githubId: String(githubUser.id),
          githubAccessToken: githubToken 
        }
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    };

    res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 24 * 60 * 60 * 1000 });
    res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 10 * 24 * 60 * 60 * 1000 });

    return res.redirect(`${process.env.CLIENT_URL}/auth/github/callback`);
  } catch (error) {
    return res.redirect(`${process.env.CLIENT_URL}/login?error=github_auth_failed`);
  }
};

export const getGithubProfile = async (req, res) => {
  try {
    // 1. Get the current user ID using the token from cookies
    const currentToken = req.cookies.accessToken;
    
    if (!currentToken) {
      return res.status(401).json({ success: false, message: "Not logged in" });
    }

    const decoded = jwt.verify(currentToken, process.env.ACCESS_TOKEN_SECRET);
    
    // 2. Find the user in the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    // 3. Check if they have a github account linked
    const githubToken = user?.githubAccessToken;

    if (!githubToken) {
      return res.status(401).json({ success: false, message: "No GitHub account connected" });
    }

    // 4. Fetch the data from GitHub
    const githubResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "Developer-Collaboration-Platform", // <--- THIS WAS MISSING!
      },
    });

    if (!githubResponse.ok) {
      console.log("GitHub API rejected the request:", githubResponse.status);
      return res.status(401).json({ success: false, message: "GitHub token invalid or expired" });
    }

    const githubData = await githubResponse.json();
    return res.status(200).json({ success: true, data: githubData });
  } catch (error) {
    console.error("Error fetching GitHub profile:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
export const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        jobTitle: user.jobTitle,
        avatar: user.avatar,
        profileCompleted: user.profileCompleted,
        platformRole: user.platformRole,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not fetch the current user.",
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    };

    if (req.user && req.user.id) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { refreshToken: null },
      });
    }

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);
    res.clearCookie("github_access_token", cookieOptions);
    res.clearCookie("token", cookieOptions); // Clear legacy token just in case

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error logging out." });
  }
};
/*
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required." });
    }
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
    // 1. Generate the Temporary Token
    const { unHashedToken, hashedToken, tokenExpiry } =
      generateTemporaryToken();
    // 2. Save the HASHED token and Expiry to the Database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry: tokenExpiry,
      },
    });
    // 3. (In a real app, you would send an email with the unHashedToken here)
    // await sendEmail(user.email, `Reset URL: http://localhost:5173/reset-password/${unHashedToken}`);
    return res.status(200).json({
      success: true,
      message:
        "Password reset token generated successfully. Please check your email.",
      resetToken: unHashedToken, // NOTE: Only returning this here for your testing! Remove this line when you implement real emails.
    });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

*/
