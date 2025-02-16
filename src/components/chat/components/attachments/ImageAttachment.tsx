
import React from 'react';
import { ImageIcon } from "lucide-react";

interface ImageAttachmentProps {
  publicUrl: string;
  onError: () => void;
}

export const ImageAttachment: React.FC<ImageAttachmentProps> = ({ publicUrl, onError }) => (
  <div className="mt-2 relative group">
    <img 
      src={publicUrl}
      alt="Attached image" 
      className="max-w-full rounded-lg max-h-[300px] object-contain bg-gray-100"
      onError={onError}
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
