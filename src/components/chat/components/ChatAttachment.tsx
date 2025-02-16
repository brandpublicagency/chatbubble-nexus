
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { FileIcon, ImageIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
      console.log('ChatAttachment attempting to load:', {
        path,
        type,
        timestamp: new Date().toISOString()
      });

      if (!path) {
        console.warn('No path provided to ChatAttachment');
        setLoading(false);
        return;
      }

      try {
        // Determine if this is an old format path (just numbers) or new format (includes file extension)
        const isOldFormat = /^\d+$/.test(path);
        
        console.log('Path format check:', {
          path,
          isOldFormat,
          timestamp: new Date().toISOString()
        });

        if (isOldFormat) {
          // For old format, we'll show a placeholder since we can't recover these images
          console.log('Old format image path detected:', {
            path,
            timestamp: new Date().toISOString()
          });
          throw new Error('Legacy image format');
        }

        // Get the public URL for the image
        const { data: urlData } = supabase.storage
          .from('chat_images')
          .getPublicUrl(path);

        console.log('Public URL generation:', {
          path,
          publicUrl: urlData?.publicUrl,
          timestamp: new Date().toISOString()
        });

        if (!urlData?.publicUrl) {
          console.error('Failed to generate public URL:', {
            path,
            timestamp: new Date().toISOString()
          });
          throw new Error('Failed to generate public URL');
        }

        // Check if file exists in bucket
        const { data: existsData, error: existsError } = await supabase.storage
          .from('chat_images')
          .download(path);

        console.log('File existence check:', {
          exists: !!existsData,
          path,
          error: existsError,
          timestamp: new Date().toISOString()
        });

        if (existsError) {
          console.error('File does not exist in bucket:', {
            path,
            error: existsError,
            timestamp: new Date().toISOString()
          });
          throw new Error('File not found in storage');
        }

        // Pre-load the image to verify it exists
        const img = new Image();
        img.src = urlData.publicUrl;
        
        await new Promise((resolve, reject) => {
          img.onload = () => {
            console.log('Image successfully preloaded:', {
              path,
              publicUrl: urlData.publicUrl,
              timestamp: new Date().toISOString()
            });
            resolve(null);
          };
          img.onerror = (error) => {
            console.error('Image preload failed:', {
              error,
              path,
              publicUrl: urlData.publicUrl,
              timestamp: new Date().toISOString()
            });
            reject(error);
          };
        });

        setPublicUrl(urlData.publicUrl);
        setImageError(false);
      } catch (error) {
        console.error('Error loading image:', {
          error,
          path,
          timestamp: new Date().toISOString()
        });
        setImageError(true);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    setImageError(false);
    fetchUrl();
  }, [path]);

  if (loading) {
    return (
      <div className="mt-2">
        <Skeleton className="w-48 h-48 rounded-lg" />
      </div>
    );
  }

  if (!path) {
    console.warn('Missing attachment path');
    return null;
  }

  if (type?.startsWith('image/')) {
    if (imageError) {
      const isOldFormat = /^\d+$/.test(path);
      return (
        <div className="mt-2 p-4 border rounded-lg bg-gray-50 text-sm text-gray-500 flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          <span>
            {isOldFormat 
              ? "This image is no longer available" 
              : "Unable to load image"}
          </span>
        </div>
      );
    }

    if (!publicUrl) {
      return (
        <div className="mt-2 p-4 border rounded-lg bg-gray-50 text-sm text-gray-500">
          Image URL not available
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
            console.error('Image failed to load:', {
              publicUrl,
              path,
              error: e,
              timestamp: new Date().toISOString()
            });
            setImageError(true);
          }}
          onLoad={() => {
            console.log('Image loaded successfully:', {
              publicUrl,
              path,
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
