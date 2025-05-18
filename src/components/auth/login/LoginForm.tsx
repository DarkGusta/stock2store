
import React, { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn } from '@/services/auth';
import { useToast } from '@/components/ui/use-toast';

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ email, setEmail }) => {
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log("Attempting login with:", { email });
      const { user, error } = await signIn(email, password);
      
      if (error) {
        console.error("Login error:", error);
      } else if (user) {
        // Successfully logged in - navigate will happen automatically via AuthContext effect
        console.log("Login successful, user:", user);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="name@company.com" 
          required 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <a href="#" className="text-sm text-blue-600 hover:underline">
            Forgot password?
          </a>
        </div>
        <div className="relative">
          <Input 
            id="password" 
            type={showPassword ? "text" : "password"} 
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button 
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Signing in...
          </div>
        ) : (
          <div className="flex items-center">
            <LogIn size={18} className="mr-2" />
            Sign in
          </div>
        )}
      </Button>
    </form>
  );
};

export default LoginForm;
