
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getInitials } from "../utils/messageFormatting";

interface ChatHeaderProps {
  contactName: string;
  onToggleInfo: () => void;
}

export const ChatHeader = ({ contactName, onToggleInfo }: ChatHeaderProps) => {
  return (
    <div className="h-14 border-b flex items-center justify-between px-4">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs">
          {getInitials(contactName)}
        </div>
        <span className="font-semibold text-sm">{contactName}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleInfo}
        className="text-gray-600 hover:text-gray-900 h-8 w-8"
      >
        <Info className="h-4 w-4" />
      </Button>
    </div>
  );
};
