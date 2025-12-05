// routes/message.route.js

import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";

import {
  getMessages,
  sendMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

// Get messages for a specific channel (with pagination)
router.get("/:channelId", protectRoute, getMessages);

// Send a message inside a channel
router.post("/:channelId/send", protectRoute, sendMessage);

export default router;
