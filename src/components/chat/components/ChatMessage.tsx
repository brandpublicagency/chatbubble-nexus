
import { cn } from "@/lib/utils";
import { formatMessageTimestamp } from "../utils/messageFormatting";
import { MessageText } from "./MessageText";

interface ChatMessageProps {
  message: {
    id: string;
    text: string;
    created_at: string;
    sender_id: number | null;
  };
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
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
        <MessageText text={message.text} />
      </div>
    </div>
  );
};
