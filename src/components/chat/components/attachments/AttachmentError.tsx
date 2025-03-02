
import React from 'react';
import { ImageIcon, Loader2, RefreshCw, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AttachmentErrorProps {
  isLegacy?: boolean;
  onRetry?: () => void;
  path?: string;
}

export const AttachmentError: React.FC<AttachmentErrorProps> = ({ isLegacy, onRetry, path }) => (
  <div className="mt-2 p-4 border rounded-lg bg-gray-50 text-sm text-gray-500 flex flex-col items-center gap-2">
    <div className="flex items-center gap-2">
      {isLegacy ? (
        <>
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <span>This image is no longer available</span>
        </>
      ) : (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Image is being processed...</span>
        </>
      )}
    </div>
    
    {path && (
      <div className="text-xs text-gray-400 mt-1">
        ID: {path}
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
        Images from older messages may not be retrievable
      </div>
    )}
  </div>
);
