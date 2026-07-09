import express from "express";
import cors from "cors";

import route from "./routes/auth.routes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth",route);

// default route
app.get("/",(req,res) => {
  res.json({
    success: true,
    message: "Developer Collaboration Platform API running"
  });
});

export default app;