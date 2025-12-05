import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import { useChatStore } from "../store/useChatStore";

const HomePage = () => {
  const { selectedChannel } = useChatStore();

  return (
    <div className="h-screen flex">
      {/* Sidebar (Channel list) */}
      <Sidebar />

      {/* Chat container */}
      <div className="flex-1 flex flex-col">
        {selectedChannel ? (
          <ChatContainer />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>Select a channel to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
