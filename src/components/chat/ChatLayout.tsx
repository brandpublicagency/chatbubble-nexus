
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { ChatWindow } from "./ChatWindow";
import { ChatHeader } from "./ChatHeader";

export const ChatLayout = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col">
      <ChatHeader />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          selectedChat={selectedChat}
          onSelectChat={setSelectedChat}
          className="w-full md:w-1/3 border-r"
        />
        <ChatWindow
          chatId={selectedChat}
          infoOpen={infoOpen}
          onToggleInfo={() => setInfoOpen(!infoOpen)}
          className="hidden md:flex md:w-2/3"
        />
      </div>
    </div>
  );
};
