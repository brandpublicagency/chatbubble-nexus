
import { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ChatMessage } from "./components/ChatMessage";
import { ChatHeader } from "./components/ChatHeader";
import { useChatMessages } from "./hooks/useChatMessages";

interface ChatWindowProps {
  chatId: string | null;
  infoOpen: boolean;
  onToggleInfo: () => void;
  className?: string;
}

export const ChatWindow = ({
  chatId,
  infoOpen,
  onToggleInfo,
  className = "",
}: ChatWindowProps) => {
  const { messages, contactName, isLoading, error } = useChatMessages(chatId);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(0);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      // If new messages came in or initial load
      if (messages.length !== prevMessagesLengthRef.current) {
        setTimeout(scrollToBottom, 100);
        prevMessagesLengthRef.current = messages.length;
      }
    }
  }, [messages, isLoading]);

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
        <ChatHeader contactName={contactName} onToggleInfo={onToggleInfo} />
        
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          {isLoading ? (
            <div className="text-center text-sm text-gray-500">Loading messages...</div>
          ) : error ? (
            <div className="text-center text-sm text-red-500">{error}</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-sm text-gray-500">No messages yet</div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </div>
          )}
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
        <div className="text-xs text-gray-500">
          <p>Contact ID: {chatId}</p>
          <p>Name: {contactName || 'Unknown'}</p>
          <p>Messages: {messages.length}</p>
          
          <div className="mt-4 p-3 bg-gray-100 rounded-md">
            <h4 className="font-medium mb-1">Technical Info</h4>
            <p>The AWS Lambda function that processes WhatsApp media needs to be updated to use the correct API endpoint format:</p>
            <pre className="text-xs bg-gray-200 p-1 mt-1 rounded overflow-x-auto">
              GET https://graph.facebook.com/v19.0/{media_id}
            </pre>
            <p className="mt-1">Instead of the current incorrect format:</p>
            <pre className="text-xs bg-gray-200 p-1 mt-1 rounded overflow-x-auto">
              GET https://graph.facebook.com/v19.0/{phone_id}/media/{media_id}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
