
import { cn } from "@/lib/utils";
import { formatMessageTimestamp } from "../utils/messageFormatting";
import { MessageText } from "./MessageText";
import { ChatAttachment } from "./ChatAttachment";
import { isWhatsAppMediaId } from "../utils/imageUtils";

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
  
  // Determine the most appropriate attachment path to use
  const determineAttachmentPath = () => {
    // First try the explicit attachment_path if present
    if (message.attachment_path) {
      return message.attachment_path;
    }
    
    // If no attachment_path but we have a meta_id that looks like a media ID
    if (message.meta_id && (isWhatsAppMediaId(message.meta_id) || message.attachment_type)) {
      return message.meta_id;
    }
    
    return null;
  };
  
  const attachmentPath = determineAttachmentPath();
  const hasAttachment = !!attachmentPath && !!message.attachment_type;
  const hasMediaId = !!message.meta_id && isWhatsAppMediaId(message.meta_id);
  
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
        
        {hasAttachment && (
          <ChatAttachment 
            path={attachmentPath} 
            type={message.attachment_type} 
          />
        )}
        
        {/* Show indicator for possible media without attachment_type */}
        {!hasAttachment && hasMediaId && (
          <ChatAttachment 
            path={message.meta_id} 
            type="image/jpeg" // Assume WhatsApp media IDs are images by default
          />
        )}
      </div>
    </div>
  );
};
