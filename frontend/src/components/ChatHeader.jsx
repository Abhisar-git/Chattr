// src/components/ChatHeader.jsx
import { X, Hash } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedChannel, setSelectedChannel } = useChatStore();

  if (!selectedChannel) return null;

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        {/* Channel Info */}
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="size-10 rounded-full bg-base-300 flex items-center justify-center">
              <Hash className="size-6 text-primary" />
            </div>
          </div>

          <div>
            <h3 className="font-medium">{selectedChannel.name}</h3>
            <p className="text-sm text-base-content/70">
              {selectedChannel.description || "Channel"}
            </p>
          </div>
        </div>

        {/* Close */}
        <button onClick={() => setSelectedChannel(null)}>
          <X />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
