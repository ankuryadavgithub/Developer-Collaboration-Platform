import express from "express";
import { getICalFeed } from "../controllers/calendar.controller.js";

const router = express.Router();

router.get("/:token", getICalFeed);

export default router;
