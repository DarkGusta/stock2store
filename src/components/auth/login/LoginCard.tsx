
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from './LoginForm';
import RegistrationForm from './RegistrationForm';
import AnimatedEye from './AnimatedEye';

const LoginCard: React.FC = () => {
  const [email, setEmail] = useState('');
  const [showCard, setShowCard] = useState(false);

  const handleAnimationComplete = () => {
    setShowCard(true);
  };

  if (!showCard) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <AnimatedEye onAnimationComplete={handleAnimationComplete} />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md animate-scale-in bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
          <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">Stock2Store</div>
        </div>
        <CardTitle className="text-2xl text-center text-gray-900 dark:text-gray-100">Welcome</CardTitle>
        <CardDescription className="text-center text-gray-600 dark:text-gray-400">
          Sign in to your account or create a new one
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-700">
            <TabsTrigger value="login" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100">Login</TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm email={email} setEmail={setEmail} />
          </TabsContent>
          <TabsContent value="register">
            <RegistrationForm />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-center text-gray-500 dark:text-gray-400">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </div>
      </CardFooter>
    </Card>
  );
};

export default LoginCard;
