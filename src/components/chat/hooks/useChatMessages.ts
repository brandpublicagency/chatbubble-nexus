
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface Message {
  id: string;
  text: string;
  created_at: string;
  contact_id: string;
  sender_id: number | null;
  attachment_path?: string | null;
  attachment_type?: string | null;
}

interface ChatData {
  messages: Message[];
  contactName: string;
  isLoading: boolean;
  error: string | null;
}

export const useChatMessages = (chatId: string | null): ChatData => {
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

        const { data: contactData, error: contactError } = await supabase
          .from('contacts')
          .select('name')
          .eq('wa_id', chatId)
          .maybeSingle();

        if (contactError) {
          console.error('Error fetching contact:', contactError);
          setError('Failed to load contact information');
          return;
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
        console.error('Unexpected error:', error);
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    // Set up realtime subscription
    const channelId = `chat-${chatId}`;
    console.log(`Setting up realtime subscription for channel: ${channelId}`);
    
    const channel = supabase.channel(channelId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations',
          filter: `contact_id=eq.${chatId}`
        },
        (payload: RealtimePostgresChangesPayload<Message>) => {
          console.log('Realtime event received:', payload);
          if (payload.new) {
            console.log('Adding new message to state:', payload.new);
            setMessages(prev => [...prev, payload.new]);
          }
        }
      )
      .subscribe(async (status) => {
        console.log(`Channel ${channelId} status:`, status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to realtime updates');
        } else if (status === 'CLOSED') {
          console.log('Channel closed');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Channel error occurred');
          setError('Failed to connect to realtime updates');
        }
      });

    return () => {
      console.log(`Cleaning up channel: ${channelId}`);
      channel.unsubscribe();
    };
  }, [chatId]);

  return { messages, contactName, isLoading, error };
};
