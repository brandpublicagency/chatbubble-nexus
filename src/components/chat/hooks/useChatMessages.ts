
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

        console.log('Initial messages loaded:', messageData);
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
    const channel = supabase.channel('realtime')
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
          if (payload.new && 
              'id' in payload.new && 
              'text' in payload.new && 
              'created_at' in payload.new && 
              'contact_id' in payload.new && 
              'sender_id' in payload.new) {
            const newMessage: Message = {
              id: payload.new.id,
              text: payload.new.text,
              created_at: payload.new.created_at,
              contact_id: payload.new.contact_id,
              sender_id: payload.new.sender_id,
              attachment_path: payload.new.attachment_path,
              attachment_type: payload.new.attachment_type
            };
            console.log('Adding new message to state:', newMessage);
            setMessages(prevMessages => {
              console.log('Previous messages:', prevMessages);
              const updatedMessages = [...prevMessages, newMessage];
              console.log('Updated messages:', updatedMessages);
              return updatedMessages;
            });
          } else {
            console.warn('Received payload is missing required fields:', payload);
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to realtime updates');
        } else if (status === 'CLOSED') {
          console.error('Channel closed');
          setError('Lost connection to realtime updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Channel error occurred');
          setError('Failed to connect to realtime updates');
        }
      });

    return () => {
      console.log('Cleaning up realtime subscription');
      channel.unsubscribe();
    };
  }, [chatId]);

  return { messages, contactName, isLoading, error };
};
