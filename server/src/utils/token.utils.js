import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const generateAccessToken = (user) =>{
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        jobTitle: user.jobTitle,
        platformRole: user.platformRole,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
    );
};

export const generateRefreshToken = (user) =>{
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        jobTitle: user.jobTitle,
        platformRole: user.platformRole,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY },
    );
};

export const generateTemporaryToken =() =>{
    const unHashedToken = crypto.randomBytes(20).toString("hex");

    const hashedToken = crypto
        .createHash("sha256")
        .update("hex");

    const tokenExpiry = new Date(Date.now()+ 2*60*1000);

    return {unHashedToken, hashedToken, tokenExpiry};
};