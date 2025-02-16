
import { useState } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ChatLayout } from "@/components/chat/ChatLayout";

const Index = () => {
  // Temporary auth state until we integrate Supabase
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <AuthLayout onLogin={() => setIsAuthenticated(true)} />;
  }

  return <ChatLayout />;
};

export default Index;
