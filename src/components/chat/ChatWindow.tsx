
import { useEffect, useState, useRef } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface ChatWindowProps {
  chatId: string | null;
  infoOpen: boolean;
  onToggleInfo: () => void;
  className?: string;
}

interface Message {
  id: string;
  text: string;
  created_at: string;
  contact_id: string;
  sender_id: number | null;
}

export const ChatWindow = ({
  chatId,
  infoOpen,
  onToggleInfo,
  className = "",
}: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [contactName, setContactName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  // Scroll to bottom when messages change or when chat is loaded
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      // Use setTimeout to ensure the DOM has updated
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isLoading]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatId) return;

      try {
        setIsLoading(true);
        setError(null);

        let { data: contactData, error: contactError } = await supabase
          .from('contacts')
          .select('name')
          .eq('wa_id', chatId)
          .maybeSingle();

        if (!contactData) {
          const { data: contactByIdData, error: contactByIdError } = await supabase
            .from('contacts')
            .select('name')
            .eq('id', chatId)
            .maybeSingle();

          if (contactByIdError) {
            console.error('Error fetching contact by ID:', contactByIdError);
          } else if (contactByIdData) {
            contactData = contactByIdData;
          }
        }

        if (contactData) {
          setContactName(contactData.name || '');
        }

        const { data: messageData, error: messageError } = await supabase
          .from('conversations')
          .select('*')
          .eq('contact_id', chatId)
          .order('created_at', { ascending: true });

        if (messageError) {
          console.error('Error fetching messages:', messageError);
          setError('Failed to load messages');
          return;
        }

        setMessages(messageData || []);
      } catch (error) {
        console.error('Error:', error);
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [chatId]);

  const formatMessageTimestamp = (timestamp: string) => {
    return format(new Date(timestamp), 'HH:mm');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatMessageText = (text: string) => {
    return text.split('\n').map((line, lineIndex) => {
      const parts = line.split(/(\*[^*]+\*)/g);
      
      const isBulletPoint = line.trim().startsWith('•');
      const bulletContent = isBulletPoint ? line.substring(1).trim() : line;
      
      return (
        <div key={lineIndex} className={cn("min-h-[1.2em]", {
          "flex items-start": isBulletPoint,
          "ml-4": isBulletPoint
        })}>
          {isBulletPoint && (
            <span className="mr-2 text-gray-600">•</span>
          )}
          {parts.map((part, index) => {
            if (part.startsWith('*') && part.endsWith('*')) {
              return (
                <strong key={index} className="font-semibold">
                  {part.slice(1, -1)}
                </strong>
              );
            }
            return <span key={index}>{part}</span>;
          })}
        </div>
      );
    });
  };

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
              {getInitials(contactName)}
            </div>
            <span className="font-semibold text-sm">{contactName}</span>
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
                <div
                  key={message.id}
                  className={cn("flex flex-col max-w-[70%] space-y-1", {
                    "ml-auto": !message.sender_id,
                  })}
                >
                  <span className="text-xs text-gray-500 px-2">
                    {formatMessageTimestamp(message.created_at)}
                  </span>
                  <div
                    className={cn("p-2.5 rounded-lg text-sm whitespace-pre-line", {
                      "bg-gray-100": !message.sender_id,
                      "border border-gray-200": message.sender_id,
                    })}
                  >
                    {formatMessageText(message.text)}
                  </div>
                </div>
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
        {/* Add chat information content here */}
      </div>
    </div>
  );
};
