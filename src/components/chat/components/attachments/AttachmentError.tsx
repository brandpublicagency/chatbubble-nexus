
import React from 'react';
import { ImageIcon, Loader2, RefreshCw, AlertCircle, ExternalLink, Info, FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AttachmentErrorProps {
  isLegacy?: boolean;
  onRetry?: () => void;
  path?: string;
  errorDetails?: string | null;
  mediaId?: string | null;
  type?: string | null;
}

export const AttachmentError: React.FC<AttachmentErrorProps> = ({ 
  isLegacy, 
  onRetry, 
  path,
  errorDetails,
  mediaId,
  type
}) => {
  const isPdf = type?.includes('pdf');
  const isImage = type?.includes('image');
  
  return (
    <div className="mt-2 p-4 border rounded-lg bg-gray-50 text-sm text-gray-500 flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        {isLegacy ? (
          <>
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>This {isPdf ? "document" : "image"} is no longer available</span>
          </>
        ) : (
          <>
            {isImage ? (
              <ImageIcon className="w-4 h-4 text-gray-400" />
            ) : isPdf ? (
              <FileIcon className="w-4 h-4 text-gray-400" />
            ) : (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            <span>Media attachment unavailable</span>
          </>
        )}
      </div>
      
      {path && (
        <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
          ID: {path.substring(0, 10)}...
          {errorDetails && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[300px]">
                  <p className="text-xs break-words">{errorDetails}</p>
                  {mediaId && (
                    <p className="text-xs mt-1 font-mono">Media ID: {mediaId.substring(0, 12)}...</p>
                  )}
                  <p className="text-xs mt-1 italic">
                    The AWS Lambda function that handles WhatsApp media needs to be updated to correctly fetch media files.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}
      
      {onRetry && !isLegacy && (
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2 text-xs" 
          onClick={onRetry}
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Retry
        </Button>
      )}
      
      {isLegacy && (
        <div className="text-xs text-gray-400 italic mt-1">
          Files from older messages may not be retrievable
        </div>
      )}
    </div>
  );
};
