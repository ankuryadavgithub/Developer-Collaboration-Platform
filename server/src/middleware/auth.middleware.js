// server/src/middleware/auth.middleware.js

import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please log in again.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Make the logged-in user's details available to the next controller.
    req.user = {
      id: decoded.id,
      email: decoded.email,
      platformRole: decoded.platformRole,
      username: decoded.username,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Your session has expired. Please log in again.",
    });
  }
};

// Require PLATFORM_ADMIN Role
export const requirePlatformAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized: Please log in." });
  }
  
  if (req.user.platformRole !== "PLATFORM_ADMIN") {
    return res.status(403).json({ success: false, message: "Forbidden: Platform Admin access required." });
  }
  
  next();
};