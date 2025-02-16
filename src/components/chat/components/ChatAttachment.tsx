
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { FileIcon, ImageIcon } from "lucide-react";

interface ChatAttachmentProps {
  path: string;
  type: string;
}

export const ChatAttachment: React.FC<ChatAttachmentProps> = ({ path, type }) => {
  const [imageError, setImageError] = useState(false);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUrl = async () => {
      if (!path) {
        console.warn('No path provided to ChatAttachment');
        return;
      }

      try {
        console.log('Attempting to get public URL for:', {
          path,
          type,
          bucket: 'chat_attachments'
        });

        const { data, error } = supabase.storage
          .from('chat_attachments')
          .getPublicUrl(path);

        if (error) {
          console.error('Error getting public URL:', error);
          return;
        }

        if (!data?.publicUrl) {
          console.error('No public URL returned for path:', path);
          return;
        }

        console.log('Successfully generated public URL:', {
          path,
          publicUrl: data.publicUrl
        });

        setPublicUrl(data.publicUrl);
      } catch (error) {
        console.error('Unexpected error getting public URL:', error);
      }
    };

    fetchUrl();
  }, [path]);
  
  if (!path || !publicUrl) {
    console.warn('Missing required data:', { path, publicUrl });
    return null;
  }
  
  if (type?.startsWith('image/')) {
    if (imageError) {
      console.warn('Image failed to load, showing fallback for:', publicUrl);
      return (
        <div className="mt-2 p-4 border rounded-lg bg-gray-50 text-sm text-gray-500">
          Unable to load image
        </div>
      );
    }

    return (
      <div className="mt-2 relative group">
        <img 
          src={publicUrl} 
          alt="Attached image" 
          className="max-w-full rounded-lg max-h-[300px] object-contain bg-gray-100"
          onError={(e) => {
            console.error('Image load error:', {
              path,
              publicUrl,
              error: e,
              timestamp: new Date().toISOString()
            });
            setImageError(true);
          }}
          onLoad={() => {
            console.log('Image loaded successfully:', {
              path,
              publicUrl,
              timestamp: new Date().toISOString()
            });
          }}
        />
        <a 
          href={publicUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg"
        >
          <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      </div>
    );
  }
  
  if (type?.startsWith('application/pdf')) {
    return (
      <a 
        href={publicUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 flex items-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <FileIcon className="w-5 h-5 text-gray-500" />
        <span className="text-sm text-gray-700">View PDF document</span>
      </a>
    );
  }
  
  return null;
};
