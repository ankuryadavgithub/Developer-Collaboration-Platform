import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import route from "./routes/auth.routes.js";
import githubRoutes from "./routes/github.routes.js";

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth",route);
app.use("/api/github", githubRoutes);

// default route
app.get("/",(req,res) => {
  res.json({
    success: true,
    message: "Developer Collaboration Platform API running"
  });
});

export default app;