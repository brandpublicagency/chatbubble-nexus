
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

  return { messages, contactName, isLoading, error };
};
