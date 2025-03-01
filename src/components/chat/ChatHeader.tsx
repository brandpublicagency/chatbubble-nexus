
import { LogOut, Settings, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ChatHeader = () => {
  return (
    <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white h-16 flex items-center px-6 justify-between shadow-md">
      <div className="flex items-center">
        <div className="text-sm font-bold tracking-wide">BONLIFE DATABASE</div>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 rounded-full h-9 w-9"
        >
          <Bell className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 rounded-full h-9 w-9"
        >
          <Settings className="h-5 w-5" />
        </Button>
        <div className="hidden md:flex items-center px-3 py-1.5 bg-white/10 rounded-full">
          <span className="text-sm font-medium">Admin</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 rounded-full h-9 w-9"
          onClick={() => window.location.reload()}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};
