import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { configureSocketServer } from "./services/socket.service.js";

dotenv.config();

const PORT = process.env.PORT || 6000;

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true } });
app.set("io", io);
configureSocketServer(io);

httpServer.listen(PORT, ()=> {
  console.log(`✅ server running: ${PORT}`);
});
