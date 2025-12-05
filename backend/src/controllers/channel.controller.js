// controllers/channel.controller.js

import Channel from "../models/channel.model.js";
import User from "../models/user.model.js";


// ---------------------------
// CREATE CHANNEL
// ---------------------------
export const createChannel = async (req, res) => {
  try {
    const { name } = req.body;
    const createdBy = req.user._id;

    // Channel must have a unique name
    const existing = await Channel.findOne({ name });
    if (existing) {
      return res.status(400).json({ error: "Channel name already exists" });
    }

    const channel = await Channel.create({
      name,
      createdBy,
      members: [createdBy],
    });

    res.status(201).json(channel);
  } catch (error) {
    console.log("Error in createChannel:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


// ---------------------------
// LIST ALL CHANNELS
// ---------------------------
export const getChannels = async (req, res) => {
  try {
    const channels = await Channel.find().sort({ createdAt: -1 });
    res.status(200).json(channels);
  } catch (error) {
    console.log("Error in getChannels:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


// ---------------------------
// JOIN CHANNEL
// ---------------------------
export const joinChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user._id;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ error: "Channel not found" });
    }

    // Already a member?
    if (channel.members.includes(userId)) {
      return res.status(400).json({ error: "Already a member of this channel" });
    }

    channel.members.push(userId);
    await channel.save();

    res.status(200).json({ message: "Joined channel successfully", channel });
  } catch (error) {
    console.log("Error in joinChannel:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


// ---------------------------
// LEAVE CHANNEL
// ---------------------------
export const leaveChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user._id;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ error: "Channel not found" });
    }

    // Remove user from members array
    channel.members = channel.members.filter(
      (member) => member.toString() !== userId.toString()
    );

    await channel.save();

    res.status(200).json({ message: "Left channel successfully" });
  } catch (error) {
    console.log("Error in leaveChannel:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


// ---------------------------
// GET CHANNEL INFO
// ---------------------------
export const getChannelInfo = async (req, res) => {
  try {
    const { channelId } = req.params;

    const channel = await Channel.findById(channelId)
      .populate("members", "username avatar");

    if (!channel) {
      return res.status(404).json({ error: "Channel not found" });
    }

    res.status(200).json(channel);
  } catch (error) {
    console.log("Error in getChannelInfo:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
