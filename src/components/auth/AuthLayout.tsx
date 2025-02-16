
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface AuthLayoutProps {
  onLogin: () => void;
}

export const AuthLayout = ({ onLogin }: AuthLayoutProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Temporary login logic until Supabase integration
    if (email && password) {
      onLogin();
      toast.success("Welcome back!");
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-600">
              Please enter your details to sign in
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-9 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-9 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                className="text-xs text-gray-600 hover:text-gray-900"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" className="w-full bg-black hover:bg-gray-800 h-9 text-sm">
              Sign in
            </Button>
          </form>
        </div>
      </div>
      <div className="hidden md:block md:w-1/2 bg-black"></div>
    </div>
  );
};
