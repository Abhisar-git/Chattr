// src/store/useChatStore.js
import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";

export const useChatStore = create((set, get) => ({
  channels: [],
  selectedChannel: null,
  messages: [],
  isChannelsLoading: false,
  isMessagesLoading: false,
  
  // STATE FOR PAGINATION
  messagesPage: 1,
  hasMoreMessages: true,

  // -------------------------
  // SELECT CHANNEL
  // -------------------------
  setSelectedChannel: (channel) => {
    const socket = useAuthStore.getState().socket; 

    const prev = get().selectedChannel;
    if (prev?._id && socket) {
      socket.emit("leaveChannel", prev._id);
    }

    // Clear old messages and reset pagination state
    set({ 
      selectedChannel: channel, 
      messages: [], 
      messagesPage: 1,
      hasMoreMessages: true,
    });

    if (channel?._id && socket) {
      socket.emit("joinChannel", channel._id);
    }
  },

  // -------------------------
  // GET CHANNEL LIST
  // -------------------------
  getChannels: async () => {
    try {
      set({ isChannelsLoading: true });
      const res = await axiosInstance.get("/channels");

      if (!Array.isArray(res.data)) {
        console.error("Invalid channels response:", res.data);
        return set({ channels: [], isChannelsLoading: false });
      }

      set({ channels: res.data, isChannelsLoading: false });
    } catch (error) {
      console.log("Error fetching channels:", error.message);
      set({ isChannelsLoading: false });
    }
  },

  // -------------------------
  // GET MESSAGES (For Initial Load and Pagination)
  // -------------------------
  getMessages: async (channelId, page = 1) => {
    const { isMessagesLoading, hasMoreMessages } = get();

    // Prevent redundant loads
    if (isMessagesLoading || (page > 1 && !hasMoreMessages)) return;

    try {
      set({ isMessagesLoading: true });
      
      const limit = 50; 
      const res = await axiosInstance.get(`/messages/${channelId}?page=${page}&limit=${limit}`); 
      
      const newMessages = res.data;

      // Check if we've reached the end of message history
      const hasMore = newMessages.length === limit;

      set(state => ({
        // Page 1: Replace messages (initial load)
        // Page > 1: Prepend older messages at the beginning
        messages: page === 1 ? newMessages : [...newMessages, ...state.messages],
        messagesPage: page + 1,
        hasMoreMessages: hasMore,
        isMessagesLoading: false,
      }));

    } catch (error) {
      console.log("Error fetching messages:", error.message);
      set({ isMessagesLoading: false });
    }
  },

  // -------------------------
  // JOIN CHANNEL
  // -------------------------
  joinChannel: async (channelId) => {
    try {
      const res = await axiosInstance.post(`/channels/${channelId}/join`);
      toast.success("Joined channel successfully!");
      
      get().getChannels(); 
      get().setSelectedChannel(res.data.channel); 
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to join channel");
      console.error("Error joining channel:", error);
    }
  },

  // -------------------------
  // LOAD HISTORY ACTION
  // -------------------------
  loadOlderMessages: () => {
    const { selectedChannel, messagesPage, getMessages } = get();
    if (selectedChannel?._id) {
      getMessages(selectedChannel._id, messagesPage);
    }
  },

  // -------------------------
  // SEND MESSAGE
  // -------------------------
  leaveChannel: async (channelId) => {
    try {
        await axiosInstance.post(`/channels/${channelId}/leave`); // Calls backend route
        toast.success("Left channel.");
        
        // 1. Deselect the channel and clear chat
        get().setSelectedChannel(null);
        
        // 2. Refresh the channels list to update membership status
        get().getChannels(); 
    } catch (error) {
        toast.error(error?.response?.data?.error || "Failed to leave channel");
        console.error("Error leaving channel:", error);
    }
  },



  sendMessage: async ({ text, image }) => {
    try {
      const { selectedChannel } = get();
      if (!selectedChannel?._id) return;

      // Socket listener will handle state update
      await axiosInstance.post(
        `/messages/${selectedChannel._id}/send`,
        { text, image }
      );
    } catch (error) {
      console.log("Error sending message:", error.message);
      toast.error("Failed to send message");
    }
  },

  // -------------------------
  // SOCKET REAL-TIME LISTENER
  // -------------------------
  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket; 
    if (!socket) return;

    socket.off("newMessage"); 

    socket.on("newMessage", (message) => {
      const selected = get().selectedChannel;

      // Only add message if it belongs to the currently selected channel
      if (message.channelId === selected?._id) {
        set(state => ({
          // Append new message at the end (newest messages at bottom)
          messages: [...state.messages, message]
        }));
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket; 
    if (!socket) return;

    socket.off("newMessage");
  },
}));