import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { signIn, createAllDemoAccounts } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Demo accounts for testing
const demoAccounts = [
  { email: 'admin@stock2store.com', role: 'Admin' },
  { email: 'warehouse@stock2store.com', role: 'Warehouse' },
  { email: 'customer@stock2store.com', role: 'Customer' },
  { email: 'analyst@stock2store.com', role: 'Analyst' }
];

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [creatingDemoAccounts, setCreatingDemoAccounts] = useState(false);
  const [demoCreationStatus, setDemoCreationStatus] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user && !loading) {
      console.log("User already logged in, redirecting to dashboard");
      navigate('/');
    }
  }, [user, navigate, loading]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log("Attempting login with:", { email });
      const { user, error } = await signIn(email, password);
      
      if (error) {
        toast({
          title: "Login failed",
          description: error.message || "Invalid email or password. Try with password: 'password'",
          variant: "destructive"
        });
      } else if (user) {
        toast({
          title: "Login successful",
          description: `Welcome back!`,
        });
        
        console.log("Successfully logged in, redirecting to home...");
        // Use a short timeout to allow the auth context to update first
        setTimeout(() => {
          navigate('/');
        }, 500); // Increased timeout to ensure auth state updates
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

  const handleCreateDemoAccounts = async () => {
    setCreatingDemoAccounts(true);
    
    try {
      const results = await createAllDemoAccounts(demoAccounts);
      setDemoCreationStatus(results);
      
      toast({
        title: "Demo accounts setup",
        description: "Process completed. You can now login with any of the available demo accounts using password: 'password'",
      });
    } catch (error) {
      console.error("Error setting up demo accounts:", error);
      toast({
        title: "Demo account setup failed",
        description: "An unexpected error occurred. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setCreatingDemoAccounts(false);
    }
  };

  // If still loading auth state, show loading indicator
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p>Checking authentication status...</p>
        </div>
      </div>
    );
  }

  // Don't render login page if user is already logged in
  if (user) {
    return null; // Will be redirected by useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="text-3xl font-bold text-blue-700">Stock2Store</div>
          </div>
          <CardTitle className="text-2xl text-center">Sign in to your account</CardTitle>
          <CardDescription className="text-center">
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
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
          <div className="mt-4 text-sm text-gray-500">
            <p className="text-center">Demo accounts:</p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {demoAccounts.map((account, index) => (
                <Button 
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs justify-start overflow-hidden"
                  onClick={() => setEmail(account.email)}
                >
                  {account.email}
                </Button>
              ))}
            </div>
            <p className="text-center mt-2">Password for all: "password"</p>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Demo Accounts
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create Demo Accounts</DialogTitle>
                  <DialogDescription>
                    This will create all demo accounts with the password "password".
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {Object.entries(demoCreationStatus).length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Status:</h4>
                      <ul className="text-sm space-y-1">
                        {Object.entries(demoCreationStatus).map(([email, success]) => (
                          <li key={email} className="flex items-center">
                            <span className={`w-3 h-3 rounded-full mr-2 ${success ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            {email}: {success ? 'Created' : 'Failed'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <Button 
                    onClick={handleCreateDemoAccounts} 
                    disabled={creatingDemoAccounts}
                    className="w-full"
                  >
                    {creatingDemoAccounts ? "Creating..." : "Create All Demo Accounts"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-500">
            Don't have an account?{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Create an account
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
