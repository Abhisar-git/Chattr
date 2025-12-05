// lib/socket.js

import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// Store online users (socketId mapped to userId)
const onlineUsers = {};      // { socketId: userId }
const userSockets = {};      // { userId: [socketId1, socketId2] } for multi-tab support

const io = new Server(server, {
  cors: {
    origin: ["https://chattr-13x3.vercel.app/"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // USER IDENTIFICATION
  const userId = socket.handshake.query.userId;

  if (userId) {
    onlineUsers[socket.id] = userId;

    if (!userSockets[userId]) {
      userSockets[userId] = [];
    }

    userSockets[userId].push(socket.id);

    // Broadcast online users
    io.emit("onlineUsers", Object.values(onlineUsers));
  }

  // ---------------------------
  // USER JOINS CHANNEL ROOM
  // ---------------------------
  socket.on("joinChannel", (channelId) => {
    socket.join(channelId);
    console.log(`User ${userId} joined channel room: ${channelId}`);
  });

  // ---------------------------
  // USER LEAVES CHANNEL ROOM
  // ---------------------------
  socket.on("leaveChannel", (channelId) => {
    socket.leave(channelId);
    console.log(`User ${userId} left channel room: ${channelId}`);
  });

  // ---------------------------
  // DISCONNECT LOGIC
  // ---------------------------
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // Remove from onlineUsers
    const uid = onlineUsers[socket.id];
    delete onlineUsers[socket.id];

    if (uid) {
      userSockets[uid] = userSockets[uid].filter((s) => s !== socket.id);

      if (userSockets[uid].length === 0) {
        delete userSockets[uid];
      }
    }

    io.emit("onlineUsers", Object.values(onlineUsers));
  });
});

export { io, app, server };
