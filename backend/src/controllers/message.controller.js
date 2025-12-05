// controllers/message.controller.js
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { io } from "../lib/socket.js";


// ---------------------------
// GET MESSAGES (with pagination)
// ---------------------------
export const getMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { page = 1, limit = 50 } = req.query; 

    const skip = (page - 1) * limit;

    const messages = await Message.find({
      channelId,
      isDeleted: false,
    })
      .sort({ createdAt: -1 }) 
      .skip(skip)
      .limit(Number(limit))
      // 💡 FIX 1: Populate fullName and profilePic (from user.model.js)
      .populate("senderId", "fullName profilePic"); 

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


// ---------------------------
// SEND A MESSAGE IN A CHANNEL
// ---------------------------
export const sendMessage = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { text, image } = req.body;
    const senderId = req.user._id;

    let imageUrl = "";

    if (image) {
      const uploaded = await cloudinary.uploader.upload(image);
      imageUrl = uploaded.secure_url;
    }

    let newMessage = await Message.create({
      senderId,
      channelId,
      text: text || "",
      image: imageUrl,
    });
    
    // 💡 FIX 2: Populate the correct fields before broadcast
    newMessage = await newMessage.populate("senderId", "fullName profilePic");
    
    const messageToBroadcast = newMessage.toObject();

    io.to(channelId).emit("newMessage", messageToBroadcast);

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};