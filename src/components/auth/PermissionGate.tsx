
import React, { ReactNode, useEffect, useState } from 'react';
import { hasPermission } from '@/services/auth/rbacService';

interface PermissionGateProps {
  resource: string;
  action: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders children based on user permissions
 */
const PermissionGate: React.FC<PermissionGateProps> = ({
  resource,
  action,
  children,
  fallback = null
}) => {
  const [canAccess, setCanAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const allowed = await hasPermission(resource, action);
        setCanAccess(allowed);
      } catch (error) {
        console.error(`Permission check failed for ${resource}:${action}:`, error);
        setCanAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkPermission();
  }, [resource, action]);

  if (loading) {
    return null; // Or a loading spinner if preferred
  }

  return <>{canAccess ? children : fallback}</>;
};

export default PermissionGate;
