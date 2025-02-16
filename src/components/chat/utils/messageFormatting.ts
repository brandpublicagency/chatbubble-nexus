
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export const formatMessageTimestamp = (timestamp: string) => {
  return format(new Date(timestamp), 'HH:mm');
};

export const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const formatMessageText = (text: string) => {
  return text.split('\n').map((line, lineIndex) => {
    const parts = line.split(/(\*[^*]+\*)/g);
    
    const isBulletPoint = line.trim().startsWith('•');
    const bulletContent = isBulletPoint ? line.substring(1).trim() : line;
    
    return (
      <div key={lineIndex} className={cn("min-h-[1.2em]", {
        "flex items-start": isBulletPoint,
        "ml-4": isBulletPoint
      })}>
        {isBulletPoint && (
          <span className="mr-2 text-gray-600">•</span>
        )}
        {parts.map((part, index) => {
          if (part.startsWith('*') && part.endsWith('*')) {
            return (
              <strong key={index} className="font-semibold">
                {part.slice(1, -1)}
              </strong>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </div>
    );
  });
};
