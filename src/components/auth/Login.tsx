
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoginCard from './login/LoginCard';
import LoadingSpinner from './login/LoadingSpinner';
import { cleanupAuthState } from '@/context/auth';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  // Clean up auth state when loading the login page (only if not authenticated)
  useEffect(() => {
    if (!user && !loading) {
      console.log("Cleaning up auth state on login page");
      cleanupAuthState();
    }
  }, [user, loading]);

  // Role-based redirect after successful login
  useEffect(() => {
    if (user && !loading) {
      console.log(`User authenticated with role: ${user.role}, redirecting...`);
      
      // Define redirect routes based on user role
      const roleRedirects = {
        customer: '/store',
        warehouse: '/warehouse',
        analyst: '/dashboard', 
        admin: '/'
      };

      const redirectTo = roleRedirects[user.role] || '/store';
      console.log(`Redirecting ${user.role} user to ${redirectTo}`);
      navigate(redirectTo, { replace: true });
    }
  }, [user, navigate, loading]);

  // If still loading auth state, show loading indicator
  if (loading) {
    return <LoadingSpinner message="Checking authentication status..." />;
  }

  // Don't render login page if user is already logged in
  if (user) {
    return <LoadingSpinner message="Redirecting..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <LoginCard />
    </div>
  );
};

export default Login;
