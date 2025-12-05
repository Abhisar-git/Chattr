// src/components/ChatContainer.jsx
import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedChannel,
    subscribeToMessages,
    unsubscribeFromMessages,
    joinChannel,
    hasMoreMessages,
    loadOlderMessages,
  } = useChatStore();

  const { authUser, onlineUsers } = useAuthStore();
  const messageEndRef = useRef(null);
  const topSentinelRef = useRef(null);

  // -------------------------------
  // EFFECT HOOKS (omitted for brevity, assume unchanged)
  // -------------------------------
  useEffect(() => {
    if (!selectedChannel?._id) return;
    getMessages(selectedChannel._id, 1); 
  }, [selectedChannel?._id, getMessages]);

  useEffect(() => {
    if (!selectedChannel?._id) return;
    const socket = useAuthStore.getState().socket;
    if (!socket) return; 
    socket.emit("joinChannel", selectedChannel._id);
    return () => {
      const cleanupSocket = useAuthStore.getState().socket;
      if (cleanupSocket) {
        cleanupSocket.emit("leaveChannel", selectedChannel._id);
      }
    };
  }, [selectedChannel?._id]);

  useEffect(() => {
    subscribeToMessages(); 
    return () => {
      unsubscribeFromMessages(); 
    };
  }, [subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ block: "end", behavior: "smooth" }); 
    }
  }, [messages]);

  useEffect(() => {
    if (!topSentinelRef.current || !hasMoreMessages) return;
    const observer = new IntersectionObserver(
        (entries) => {
            const sentinelEntry = entries[0];
            if (sentinelEntry.isIntersecting && !isMessagesLoading) { 
                loadOlderMessages();
            }
        },
        { threshold: 1.0 }
    );
    observer.observe(topSentinelRef.current);
    return () => {
        if (topSentinelRef.current) {
            observer.unobserve(topSentinelRef.current);
        }
    };
  }, [hasMoreMessages, isMessagesLoading, loadOlderMessages]);


  // -------------------------------
  // LOADING / MEMBERSHIP CHECK (omitted for brevity, assume unchanged)
  // -------------------------------
  if (!selectedChannel) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Select a channel to start chatting
      </div>
    );
  }

  const isMember = selectedChannel.members?.includes(authUser._id); 

  if (!isMember) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold mb-2">Join #{selectedChannel.name}</h2>
        <p className="text-gray-400 mb-6">You must join this channel to view and send messages.</p>
        <button onClick={() => joinChannel(selectedChannel._id)} className="btn btn-primary btn-lg">
          Join Channel
        </button>
      </div>
    );
  }

  if (isMessagesLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
      </div>
    );
  }

  // -------------------------------
  // UI RENDER
  // -------------------------------
  const sortedMessages = [...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col"> 
        
        {hasMoreMessages && (
             <div ref={topSentinelRef} style={{ height: '1px' }} />
        )}
        {(isMessagesLoading && hasMoreMessages) && (
            <div className="text-center text-primary py-2">Loading history...</div>
        )}
        
        {!hasMoreMessages && messages.length > 0 && (
            <div className="text-center text-zinc-500 py-2">End of channel history</div>
        )}

        {sortedMessages.map((message, index) => {
          const isMine = message.senderId?._id === authUser._id;
          const isOnline = onlineUsers.includes(message.senderId?._id); 
          const isLastMessage = index === sortedMessages.length - 1; 

          return (
            <div
              key={message._id}
              className={`chat ${isMine ? "chat-end" : "chat-start"}`}
              ref={isLastMessage ? messageEndRef : null} 
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      isMine
                        ? authUser.profilePic || "/avatar.png" 
                        // 💡 FIX 3: Use profilePic field from populated sender object
                        : message.senderId.profilePic || "/avatar.png" 
                    }
                    alt="profile pic"
                  />
                </div>
              </div>

              <div className="chat-header mb-1">
                {/* 💡 FIX 4: Display fullName from populated sender object */}
                <span>{isMine ? "You" : message.senderId.fullName}</span> 
                {isOnline && <span className="text-success text-xs ml-1">● Active</span>} 
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>

              <div className="chat-bubble flex flex-col">
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}
                {message.text && <p>{message.text}</p>}
              </div>
            </div>
          );
        })}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;