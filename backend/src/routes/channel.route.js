// routes/channel.route.js

import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";

import {
  createChannel,
  getChannels,
  joinChannel,
  leaveChannel,
  getChannelInfo,
} from "../controllers/channel.controller.js";

const router = express.Router();

// Create a channel
router.post("/create", protectRoute, createChannel);

// Get all channels
router.get("/", protectRoute, getChannels);

// Join a channel
router.post("/:channelId/join", protectRoute, joinChannel);

// Leave a channel
router.post("/:channelId/leave", protectRoute, leaveChannel);

// Get info about one channel
router.get("/:channelId", protectRoute, getChannelInfo);

export default router;
