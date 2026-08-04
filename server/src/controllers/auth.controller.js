import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import {
  generateAccessToken,
  generateRefreshToken,
  generateTemporaryToken,
} from "../utils/token.utils.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const prisma = new PrismaClient({});

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
);

export const registerUser = async(req,res) => {
  try {
    const { username, email, role, password } = req.body;

    if (!username || !email || !role || !password) {
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

    const validRoles = [
      "project_manager",
      "developer",
      "frontend_developer",
      "backend_developer",
      "fullstack_developer",
    ];
    if (!validRoles.includes(role)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid role selected." });
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
        role,
        password: hashedPassword,
      },
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully!",
      data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
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
      sameSite: "strict",
    };

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 24 * 60 * 60 * 1000,
    }); // 1 Day
    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 10 * 24 * 60 * 60 * 1000,
    }); // 10 Days

    return res.status(200).json({
      success: true,
      message: "Login Successful!",
      accessToken,
      refreshToken,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
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

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required."
      });
    }

    // Verify token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    const {
      email,
      picture,
      sub
    } = payload;

    // Find user
    let user = await prisma.user.findUnique({
      where: {
        email
      }
    });

    // First Google Login
    if (!user) {

      user = await prisma.user.create({

        data: {

          email,

          username: null,

          password: null,

          role: null,

          provider: "google",

          providerId: sub,

          avatar: picture

        }

      });

    }

    // JWT
    const token = jwt.sign(

      {
        id: user.id,
        email: user.email,
        role: user.role
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "1d"
      }

    );

    // Cookie
    res.cookie("token", token, {

      httpOnly: true,

      secure: process.env.NODE_ENV === "production",

      sameSite: "strict",

      maxAge: 24 * 60 * 60 * 1000

    });

    return res.status(200).json({

      success: true,

      message: "Google Login Successful",

      profileCompleted: user.profileCompleted,

      user: {

        id: user.id,

        username: user.username,

        email: user.email,

        role: user.role,

        avatar: user.avatar,

        provider: user.provider

      }

    });

  }

  catch (error) {

    console.error(error);

    return res.status(500).json({

      success: false,

      message: "Google Login Failed"

    });

  }
};

export const completeProfile = async (req, res) => {
  try {
    const username = req.body.username?.trim();
    const { role } = req.body;

    if (!username || !role) {
      return res.status(400).json({
        success: false,
        message: "Username and role are required.",
      });
    }

    if (username.length < 3 || username.includes(" ")) {
      return res.status(400).json({
        success: false,
        message: "Username must be at least 3 characters and contain no spaces.",
      });
    }

    const validRoles = [
      "project_manager",
      "developer",
      "frontend_developer",
      "backend_developer",
      "fullstack_developer",
    ];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role selected.",
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
        role,
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
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        provider: updatedUser.provider,
        profileCompleted: updatedUser.profileCompleted,
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
