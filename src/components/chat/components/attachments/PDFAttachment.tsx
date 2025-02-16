
import React from 'react';
import { FileIcon } from "lucide-react";

interface PDFAttachmentProps {
  publicUrl: string;
}

export const PDFAttachment: React.FC<PDFAttachmentProps> = ({ publicUrl }) => (
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
