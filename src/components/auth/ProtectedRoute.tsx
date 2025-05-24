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
      if (!user) {
        setHasAccess(false);
        setPermissionChecked(true);
        return;
      }

      try {
        const allowed = await hasPermission(resource, action);
        setHasAccess(allowed);
        if (!allowed) {
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

    if (!loading) {
      checkPermission();
    }
  }, [user, loading, resource, action, toast]);

  // Show loading state
  if (loading || !permissionChecked) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
