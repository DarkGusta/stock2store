
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoginCard from './login/LoginCard';
import LoadingSpinner from './login/LoadingSpinner';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user && !loading) {
      console.log("User already logged in, redirecting to dashboard");
      navigate('/', { replace: true });
    }
  }, [user, navigate, loading]);

  // If still loading auth state, show loading indicator
  if (loading) {
    return <LoadingSpinner message="Checking authentication status..." />;
  }

  // Don't render login page if user is already logged in
  if (user) {
    return <LoadingSpinner message="You are already logged in. Redirecting to dashboard..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <LoginCard />
    </div>
  );
};

export default Login;
