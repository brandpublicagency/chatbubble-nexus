
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
