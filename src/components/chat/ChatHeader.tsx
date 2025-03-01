
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ChatHeader = () => {
  return (
    <header className="bg-black text-white h-14 flex items-center px-6 justify-between">
      <div className="text-sm font-semibold">BONLIFE DATABASE</div>
      
      <nav className="hidden md:flex items-center space-x-8">
        <a href="/" className="text-sm hover:text-gray-300 transition-colors">
          Home
        </a>
      </nav>
      
      <div className="flex items-center space-x-4">
        <span className="hidden md:inline text-sm">Admin</span>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:text-gray-300 h-8 w-8"
          onClick={() => window.location.reload()}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};
