
import { cn } from "@/lib/utils";
import { formatMessageTimestamp } from "../utils/messageFormatting";
import { MessageText } from "./MessageText";
import { ChatAttachment } from "./ChatAttachment";

interface ChatMessageProps {
  message: {
    id: string;
    text: string;
    created_at: string;
    sender_id: number | null;
    attachment_path?: string | null;
    attachment_type?: string | null;
    meta_id?: string | null;
  };
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  console.log('Message data:', message); // Debug log
  
  // Determine which ID to use for the attachment
  // First try attachment_path, then fallback to meta_id
  const attachmentPath = message.attachment_path || message.meta_id || null;
  
  return (
    <div
      className={cn("flex flex-col max-w-[70%] space-y-1", {
        "ml-auto": !message.sender_id,
      })}
    >
      <span className="text-xs text-gray-500 px-2">
        {formatMessageTimestamp(message.created_at)}
      </span>
      <div
        className={cn("p-2.5 rounded-lg text-sm whitespace-pre-line", {
          "bg-gray-100": !message.sender_id,
          "border border-gray-200": message.sender_id,
        })}
      >
        {message.text && <MessageText text={message.text} />}
        {attachmentPath && message.attachment_type && (
          <ChatAttachment 
            path={attachmentPath} 
            type={message.attachment_type} 
          />
        )}
      </div>
    </div>
  );
};
