
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import LoginForm from './LoginForm';
import DemoAccountSection from './DemoAccountSection';

const LoginCard: React.FC = () => {
  const [email, setEmail] = useState('');

  return (
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
        <LoginForm email={email} setEmail={setEmail} />
        <DemoAccountSection setEmail={setEmail} />
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
  );
};

export default LoginCard;
