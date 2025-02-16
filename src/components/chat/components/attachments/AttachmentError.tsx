
import React from 'react';
import { ImageIcon } from "lucide-react";

interface AttachmentErrorProps {
  isLegacy?: boolean;
}

export const AttachmentError: React.FC<AttachmentErrorProps> = ({ isLegacy }) => (
  <div className="mt-2 p-4 border rounded-lg bg-gray-50 text-sm text-gray-500 flex items-center gap-2">
    <ImageIcon className="w-4 h-4" />
    <span>
      {isLegacy 
        ? "This image is no longer available" 
        : "Unable to load image"}
    </span>
  </div>
);
