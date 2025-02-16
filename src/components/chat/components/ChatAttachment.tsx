
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
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUrl = async () => {
      console.log('ChatAttachment mounted with:', {
        path,
        type,
        timestamp: new Date().toISOString()
      });

      if (!path) {
        console.warn('No path provided to ChatAttachment');
        setLoading(false);
        return;
      }

      // Add file extension based on mime type if not present
      let fullPath = path;
      if (!path.includes('.')) {
        const extension = type.split('/')[1] || 'jpeg';
        fullPath = `${path}.${extension}`;
        console.log('Added file extension:', {
          originalPath: path,
          fullPath,
          mimeType: type,
          timestamp: new Date().toISOString()
        });
      }

      try {
        // First check if the file exists
        const { data: existsData, error: existsError } = await supabase.storage
          .from('chat_images')  // Changed from chat_attachments to chat_images
          .list('', {
            search: fullPath
          });

        console.log('Storage list result:', {
          exists: existsData && existsData.length > 0,
          searchPath: fullPath,
          results: existsData,
          error: existsError,
          timestamp: new Date().toISOString()
        });

        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('chat_images')  // Changed from chat_attachments to chat_images
          .getPublicUrl(fullPath);

        if (!urlData?.publicUrl) {
          console.error('Failed to generate public URL:', {
            path: fullPath,
            timestamp: new Date().toISOString()
          });
          setLoading(false);
          return;
        }

        console.log('Public URL generated:', {
          originalPath: path,
          fullPath,
          publicUrl: urlData.publicUrl,
          timestamp: new Date().toISOString()
        });

        setPublicUrl(urlData.publicUrl);
        setLoading(false);
      } catch (error) {
        console.error('Error in ChatAttachment:', {
          error,
          originalPath: path,
          fullPath,
          type,
          timestamp: new Date().toISOString()
        });
        setLoading(false);
      }
    };

    fetchUrl();
  }, [path, type]);

  if (loading) {
    return (
      <div className="mt-2 p-4 border rounded-lg bg-gray-50 text-sm text-gray-500">
        Loading attachment...
      </div>
    );
  }
  
  if (!path || !publicUrl) {
    console.warn('Missing required data:', {
      path,
      publicUrl,
      timestamp: new Date().toISOString()
    });
    return null;
  }

  if (type?.startsWith('image/')) {
    if (imageError) {
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
