import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChatWindowProps {
  chatId: string | null;
  infoOpen: boolean;
  onToggleInfo: () => void;
  className?: string;
}

const mockMessages = [
  {
    id: "1",
    sender: "user",
    content: "Hello! How can you help me today?",
    timestamp: "10:30 AM",
  },
  {
    id: "2",
    sender: "bot",
    content: "Hi! I'm here to help you with any questions about our database.",
    timestamp: "10:31 AM",
  },
];

export const ChatWindow = ({
  chatId,
  infoOpen,
  onToggleInfo,
  className = "",
}: ChatWindowProps) => {
  if (!chatId) {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <p className="text-sm text-gray-500">Select a conversation to start chatting</p>
      </div>
    );
  }

  return (
    <div className={cn("flex relative", className)}>
      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b flex items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs">
              JD
            </div>
            <span className="font-semibold text-sm">John Doe</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleInfo}
            className="text-gray-600 hover:text-gray-900 h-8 w-8"
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {mockMessages.map((message) => (
              <div
                key={message.id}
                className={cn("flex flex-col max-w-[70%] space-y-1", {
                  "ml-auto": message.sender === "user",
                })}
              >
                <span className="text-xs text-gray-500 px-2">
                  {message.timestamp}
                </span>
                <div
                  className={cn("p-2.5 rounded-lg text-sm", {
                    "bg-gray-100": message.sender === "user",
                    "border border-gray-200": message.sender === "bot",
                  })}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div
        className={cn(
          "absolute top-0 right-0 h-full w-72 bg-white border-l transform transition-transform duration-300 ease-in-out p-4",
          {
            "translate-x-0": infoOpen,
            "translate-x-full": !infoOpen,
          }
        )}
      >
        <h3 className="font-semibold mb-3 text-sm">Chat Information</h3>
        {/* Add chat information content here */}
      </div>
    </div>
  );
};
