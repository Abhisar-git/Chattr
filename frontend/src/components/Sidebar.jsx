// src/components/Sidebar.jsx
import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Hash, Plus, X } from "lucide-react"; // 💡 Added X icon
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore"; // 💡 Added useAuthStore

const axios = axiosInstance;

const Sidebar = () => {
  const {
    channels,
    getChannels,
    selectedChannel,
    setSelectedChannel,
    isChannelsLoading,
    leaveChannel, // 💡 Destructure the leaveChannel action
  } = useChatStore();

  const { authUser } = useAuthStore(); // 💡 Get authUser to check membership

  const [showModal, setShowModal] = useState(false);
  const [newChannel, setNewChannel] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    getChannels();
  }, [getChannels]);

  const handleCreateChannel = async () => {
    if (!newChannel.name.trim()) {
      toast.error("Channel name is required");
      return;
    }

    try {
      await axios.post("/channels/create", newChannel);

      toast.success("Channel created!");
      setShowModal(false);
      setNewChannel({ name: "", description: "" });

      getChannels(); // refresh list
    } catch (error) {
      toast.error("Failed to create channel");
      console.log(error);
    }
  };
  
  // 💡 New handler to prevent channel selection when clicking leave
  const handleLeaveChannel = (e, channelId) => {
    e.stopPropagation(); // Prevents the parent button's onClick (setSelectedChannel)
    leaveChannel(channelId);
  }

  if (isChannelsLoading) return <SidebarSkeleton />;

  return (
    <>
      {/* SIDEBAR */}
      <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col pt-16">
        <div className="border-b border-base-300 w-full p-5 flex flex-col gap-3">
         
          {/* Add Channel Button */}
          <button
            onClick={() => setShowModal(true)}
            className="p-2 rounded transition shrink-0 border-b border-base-300 hover:bg-slate-700"
          >
            Create new Channel
            <Plus className="size-5 mx-auto mt-1" />
          </button>

           <div className="flex items-center gap-2 border-b border-base-300 hover:bg-base-300">
            <Hash className="size-6" />
            <span className="font-medium hidden lg:block">Channels</span>
          </div>
        </div>

        <div className="overflow-y-auto w-full py-3">
          {channels.length === 0 && (
            <div className="text-center text-zinc-500 py-4">
              No channels found
            </div>
          )}

          {channels.map((channel) => {
            // Check if the current logged-in user is a member of this channel
            const isMember = channel.members.includes(authUser?._id);
            
            return (
              <button
                key={channel._id}
                onClick={() => setSelectedChannel(channel)}
                className={`
                  w-full p-3 flex items-center gap-3 justify-between // 💡 Added justify-between for spacing
                  hover:bg-base-300 transition-colors
                  ${
                    selectedChannel?._id === channel._id
                      ? "bg-base-300 ring-1 ring-base-300"
                      : ""
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className="mx-auto lg:mx-0">
                    <Hash className="size-6 text-primary" />
                  </div>

                  <div className="hidden lg:block text-left min-w-0">
                    <div className="font-medium truncate">{channel.name}</div>
                    <div className="text-sm text-zinc-400">
                      {channel.description || "Channel"}
                    </div>
                  </div>
                </div>

                {/* 💡 LEAVE CHANNEL BUTTON */}
                {isMember && (
                    <button
                        onClick={(e) => handleLeaveChannel(e, channel._id)}
                        className="btn btn-xs btn-ghost text-red-400 hover:bg-red-900 shrink-0"
                        title="Leave Channel"
                    >
                        <X className="size-4" />
                    </button>
                )}
              </button>
          )})}
        </div>
      </aside>

      {/* ADD CHANNEL MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-base-200 rounded-xl p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Create New Channel</h3>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Channel name"
                className="input input-bordered w-full"
                value={newChannel.name}
                onChange={(e) =>
                  setNewChannel({ ...newChannel, name: e.target.value })
                }
              />

              <textarea
                placeholder="Description (optional)"
                className="textarea textarea-bordered w-full"
                value={newChannel.description}
                onChange={(e) =>
                  setNewChannel({ ...newChannel, description: e.target.value })
                }
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                className="btn btn-ghost"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button className="btn btn-primary" onClick={handleCreateChannel}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;