import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient({});


export const registerUser = async(req,res) => {
  try {
    const {username, email, role, password} = req.body;

    if(!username || !email || !role || !password){
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    if(username.length<3 || username.includes(" ")){
      return res.status(400).json(
        {
          success: false,
          message: "Username must be at least 3 characters and contain no spaces."
        }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)){
      return res.status(400).json(
        {
          success: false,
          message: "Please provide a valid email address."
        }
      );
    }

    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long, and include at least one number and one special character."
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
        OR: [{ email}, {username}],
      },
    });

    if(existingUser){
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
      data:{
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
        },
    })

  } catch (error) {
    console.error("Database error during signup:", error);
    
    return res.status(500).json(
      {
        success: false,
        message: "Internal Server Error"
      }
    );
  }
};

export const loginUser = async (req, res) =>{
  try {
    const {username, password} = req.body;

    if(!username || !password){
      return res.status(400).json(
        {
          success: false,
          message: "Username and password are required.",
        }
      );
    }

    const user = await prisma.user.findFirst(
      {
        where: { username},
      }
    );

    if(!user){
      return res.status(401).json(
        {
          success: false,
          message: "Invalid credentials.",
        }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid){
      return res.status(401).json(
        {
          success: false,
          message: "Invalid credentials.",
        }
      );
    }

    const token = jwt.sign(
      {
        id: user.id, username: user.username, role: user.role
      },

      process.env.JWT_SECRET || "fallback_secret_key",
      {
        expiresIn: "1d"
      }
    );

    res.cookie("token", token,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      }
    );

    return res.status(200).json(
      {
        success: true,
        message: "Login Successful!",
        token,
        data:
        {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      }
    );
  } catch (error) {
    console.error("Database Error during Login:", error);

    return res.status(500).json(
      {
        success: false,
        message: "Internal Server Error"
      }
    );
    
    
  }
};