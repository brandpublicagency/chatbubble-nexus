
import { useEffect, useState } from "react";
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

  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatId) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch contact information
        const { data: contactData, error: contactError } = await supabase
          .from('contacts')
          .select('name')
          .eq('wa_id', chatId)
          .single();

        if (contactError) {
          console.error('Error fetching contact:', contactError);
          setError('Failed to load contact information');
          return;
        }

        if (contactData) {
          setContactName(contactData.name || '');
        }

        // Fetch messages
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

        <ScrollArea className="flex-1 p-4">
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
                    className={cn("p-2.5 rounded-lg text-sm", {
                      "bg-gray-100": !message.sender_id,
                      "border border-gray-200": message.sender_id,
                    })}
                  >
                    {message.text}
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
