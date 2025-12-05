// src/lib/socket.js
import { io } from "socket.io-client";

const BASE_URL =
  "https://chattr-itmd.onrender.com/";

let socket = null;

/**
 * Create and return a socket instance. If already created, returns same instance.
 * @param {string} userId
 */
export const createSocket = (userId) => {
  if (!userId) return null;
  if (socket && socket.connected) return socket;

  socket = io(BASE_URL, {
    query: { userId },
  });

  return socket;
};

export const getSocket = () => socket;

/** Disconnect and cleanup */
export const disconnectSocket = () => {
  try {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  } catch (e) {
    console.warn("Error disconnecting socket:", e);
    socket = null;
  }
};
