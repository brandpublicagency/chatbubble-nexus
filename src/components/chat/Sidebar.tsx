
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarProps {
  selectedChat: string | null;
  onSelectChat: (id: string) => void;
  className?: string;
}

const mockConversations = [
  {
    id: "1",
    name: "John Doe",
    lastMessage: "Hey, how are you?",
    timestamp: "10:30 AM",
    initials: "JD",
  },
  {
    id: "2",
    name: "Jane Smith",
    lastMessage: "Can you help me with something?",
    timestamp: "Yesterday",
    initials: "JS",
  },
];

export const Sidebar = ({ selectedChat, onSelectChat, className = "" }: SidebarProps) => {
  return (
    <div className={`flex flex-col bg-white ${className}`}>
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
          <Input
            placeholder="Search conversations"
            className="pl-9 pr-4 py-2 text-sm bg-gray-100 border-none h-9"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="space-y-0.5 px-2">
          {mockConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelectChat(conversation.id)}
              className={`w-full p-3 flex items-start space-x-3 hover:bg-gray-100 transition-colors rounded-md ${
                selectedChat === conversation.id ? "bg-gray-100" : ""
              }`}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs">
                {conversation.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <span className="font-semibold truncate text-sm">
                    {conversation.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {conversation.timestamp}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {conversation.lastMessage}
                </p>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
