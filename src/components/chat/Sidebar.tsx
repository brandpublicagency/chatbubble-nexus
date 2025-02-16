
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface SidebarProps {
  selectedChat: string | null;
  onSelectChat: (id: string) => void;
  className?: string;
}

interface Conversation {
  contact_id: string;
  contact_name: string;
  last_message: string;
  created_at: string;
}

export const Sidebar = ({ selectedChat, onSelectChat, className = "" }: SidebarProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Fetching conversations...');
        
        // First, let's check if we can query the conversations table directly
        const { data: conversationsData, error: conversationsError } = await supabase
          .from('conversations')
          .select('*')
          .limit(1);
        console.log('Raw conversations data:', conversationsData, 'Error:', conversationsError);
        
        // Then check the contacts table
        const { data: contactsData, error: contactsError } = await supabase
          .from('contacts')
          .select('*')
          .limit(1);
        console.log('Raw contacts data:', contactsData, 'Error:', contactsError);
        
        // Now try the RPC function
        const { data, error } = await supabase.rpc('get_conversations');
        console.log('RPC function response:', { data, error });
        
        if (error) {
          console.error('Error fetching conversations:', error);
          setError(`Failed to load conversations: ${error.message}`);
          return;
        }

        console.log('Final conversations data:', data);
        setConversations(data || []);
      } catch (error) {
        console.error('Error:', error);
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return format(date, 'HH:mm');
    }
    return format(date, 'MMM d');
  };

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
          {isLoading ? (
            <div className="p-4 text-sm text-gray-500 text-center">Loading conversations...</div>
          ) : error ? (
            <div className="p-4 text-sm text-red-500 text-center">{error}</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 text-center">No conversations yet</div>
          ) : (
            conversations.map((conversation) => (
              <button
                key={conversation.contact_id}
                onClick={() => onSelectChat(conversation.contact_id)}
                className={`w-full p-3 flex items-start space-x-3 hover:bg-gray-100 transition-colors rounded-md ${
                  selectedChat === conversation.contact_id ? "bg-gray-100" : ""
                }`}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs">
                  {getInitials(conversation.contact_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <span className="font-semibold truncate text-sm">
                      {conversation.contact_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(conversation.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {conversation.last_message}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
