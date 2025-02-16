
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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

      console.log('Fetching messages for chatId:', chatId);

      try {
        setIsLoading(true);
        setError(null);

        let { data: contactData, error: contactError } = await supabase
          .from('contacts')
          .select('name')
          .eq('wa_id', chatId)
          .maybeSingle();

        if (contactError) {
          console.error('Error fetching contact by wa_id:', contactError);
        }

        if (!contactData) {
          console.log('No contact found with wa_id, trying id...');
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
          console.log('Found contact:', contactData);
          setContactName(contactData.name || '');
        } else {
          console.log('No contact found for ID:', chatId);
        }

        console.log('Fetching conversations for contact_id:', chatId);
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

        console.log('Fetched messages:', messageData);
        setMessages(messageData || []);
      } catch (error) {
        console.error('Unexpected error:', error);
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    console.log('Setting up realtime subscription for chatId:', chatId);
    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `contact_id=eq.${chatId}`,
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          
          if (payload.eventType === 'INSERT') {
            console.log('Inserting new message:', payload.new);
            setMessages((currentMessages) => [...currentMessages, payload.new as Message]);
          } else if (payload.eventType === 'UPDATE') {
            console.log('Updating message:', payload.new);
            setMessages((currentMessages) =>
              currentMessages.map((msg) =>
                msg.id === payload.new.id ? payload.new as Message : msg
              )
            );
          } else if (payload.eventType === 'DELETE') {
            console.log('Deleting message:', payload.old);
            setMessages((currentMessages) =>
              currentMessages.filter((msg) => msg.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  return { messages, contactName, isLoading, error };
};
