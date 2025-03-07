
import React, { useState, useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { loadImage } from '../utils/imageUtils';
import { ImageAttachment } from './attachments/ImageAttachment';
import { PDFAttachment } from './attachments/PDFAttachment';
import { AttachmentError } from './attachments/AttachmentError';
import { toast } from "sonner";

interface ChatAttachmentProps {
  path: string;
  type: string;
}

export const ChatAttachment: React.FC<ChatAttachmentProps> = ({ path, type }) => {
  const [imageError, setImageError] = useState(false);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLegacyFormat, setIsLegacyFormat] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [mediaId, setMediaId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUrl = async () => {
      if (!path) {
        setLoading(false);
        return;
      }

      try {
        console.log('Loading image with path:', path);
        const result = await loadImage(path);
        console.log('Image load result:', result);
        setPublicUrl(result.publicUrl);
        setImageError(result.error);
        setIsLegacyFormat(result.isOldFormat);
        setErrorDetails(result.errorDetails || null);
        setMediaId(result.mediaId || null);
      } catch (error) {
        console.error('Error loading image:', error);
        setImageError(true);
        setIsLegacyFormat(/^\d+$/.test(path) && path.length > 8);
        setErrorDetails(error.message || 'Unknown error');
        
        // Show a toast notification when we can't load the image
        toast.error("Failed to load media attachment", {
          description: "The attachment could not be retrieved from storage."
        });
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    setImageError(false);
    fetchUrl();
  }, [path, retryCount]);

  // Function to retry loading the image
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (loading) {
    return <Skeleton className="mt-2 w-48 h-48 rounded-lg" />;
  }

  if (!path) {
    return null;
  }

  if (type?.startsWith('image/')) {
    if (imageError) {
      return <AttachmentError 
        isLegacy={isLegacyFormat} 
        onRetry={handleRetry} 
        path={path}
        errorDetails={errorDetails}
        mediaId={mediaId}
        type={type}
      />;
    }

    if (!publicUrl) {
      return <AttachmentError 
        onRetry={handleRetry} 
        path={path}
        errorDetails={errorDetails || "No URL found for image"}
        mediaId={mediaId}
        type={type}
      />;
    }

    return (
      <ImageAttachment 
        publicUrl={publicUrl} 
        onError={() => setImageError(true)} 
      />
    );
  }
  
  if (type?.startsWith('application/pdf') && publicUrl) {
    return <PDFAttachment publicUrl={publicUrl} />;
  }
  
  return <AttachmentError 
    path={path}
    errorDetails="Unsupported file type"
    type={type}
  />;
};
