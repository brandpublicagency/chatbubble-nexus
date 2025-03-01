
import React from 'react';
import { ImageIcon, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AttachmentErrorProps {
  isLegacy?: boolean;
  onRetry?: () => void;
}

export const AttachmentError: React.FC<AttachmentErrorProps> = ({ isLegacy, onRetry }) => (
  <div className="mt-2 p-4 border rounded-lg bg-gray-50 text-sm text-gray-500 flex flex-col items-center gap-2">
    <div className="flex items-center gap-2">
      {isLegacy ? (
        <>
          <ImageIcon className="w-4 h-4" />
          <span>This image is no longer available</span>
        </>
      ) : (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Image is being processed...</span>
        </>
      )}
    </div>
    
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
  </div>
);
