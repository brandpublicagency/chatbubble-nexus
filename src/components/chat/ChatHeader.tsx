
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ChatHeader = () => {
  return (
    <header className="bg-black text-white h-16 flex items-center px-4 justify-between">
      <div className="font-semibold">BONLIFE DATABASE</div>
      
      <nav className="hidden md:flex items-center space-x-6">
        <a href="/" className="hover:text-gray-300 transition-colors">
          Home
        </a>
        <a href="/images" className="hover:text-gray-300 transition-colors">
          Images
        </a>
      </nav>
      
      <div className="flex items-center space-x-4">
        <span className="hidden md:inline">Admin</span>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:text-gray-300"
          onClick={() => window.location.reload()}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};
