
import React from 'react';
import { supabase } from "@/integrations/supabase/client";
import { FileIcon, ImageIcon } from "lucide-react";

interface ChatAttachmentProps {
  path: string;
  type: string;
}

export const ChatAttachment: React.FC<ChatAttachmentProps> = ({ path, type }) => {
  console.log('Rendering ChatAttachment with:', { path, type }); // Debug log
  
  // Make sure we have a valid path
  if (!path) {
    console.warn('No path provided to ChatAttachment');
    return null;
  }

  // Get the public URL for the file
  const { data: { publicUrl } } = supabase.storage
    .from('chat_attachments')
    .getPublicUrl(path);
  
  console.log('Generated public URL:', publicUrl); // Debug log
  
  if (type?.startsWith('image/')) {
    return (
      <div className="mt-2 relative group">
        <img 
          src={publicUrl} 
          alt="Attached image" 
          className="max-w-full rounded-lg max-h-[300px] object-contain bg-gray-100"
          onError={(e) => {
            console.error('Image failed to load:', publicUrl);
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
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
