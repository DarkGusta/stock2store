
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { hasPermission } from '@/services/auth/rbacService';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  resource: string;
  action: string;
  fallbackPath?: string;
}

/**
 * A component that protects routes based on user permissions
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  resource, 
  action, 
  fallbackPath = '/login' 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const [hasAccess, setHasAccess] = useState(false);
  const [permissionChecked, setPermissionChecked] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      if (!user || loading) {
        setHasAccess(false);
        setPermissionChecked(!loading);
        return;
      }

      try {
        console.log(`Checking permission for ${resource}:${action} for user role: ${user.role}`);
        const allowed = await hasPermission(resource, action);
        console.log(`Permission result: ${allowed}`);
        setHasAccess(allowed);
        
        if (!allowed) {
          console.log(`Access denied for ${resource}:${action}`);
          toast({
            title: "Access denied",
            description: `You don't have permission to access this resource.`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error checking permission:', error);
        setHasAccess(false);
      } finally {
        setPermissionChecked(true);
      }
    };

    // Add a small delay to ensure RBAC system is initialized
    const timeoutId = setTimeout(checkPermission, 100);
    
    return () => clearTimeout(timeoutId);
  }, [user?.id, user?.role, loading, resource, action, toast]);

  // Show loading state while checking auth or permissions
  if (loading || !permissionChecked) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Redirect to fallback if not authorized
  if (!hasAccess) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
