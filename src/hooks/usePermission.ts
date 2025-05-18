
import { useCallback, useEffect, useState } from 'react';
import { hasPermission } from '@/services/auth/rbacService';

/**
 * Hook to check if the current user has a specific permission
 * @param resource The resource to check
 * @param action The action to check
 * @returns boolean indicating if the user has permission
 */
export function usePermission(resource: string, action: string) {
  const [canAccess, setCanAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // Function to check permission
  const checkPermission = useCallback(async () => {
    try {
      setLoading(true);
      const hasAccess = await hasPermission(resource, action);
      setCanAccess(hasAccess);
    } catch (error) {
      console.error(`Error checking permission ${resource}:${action}:`, error);
      setCanAccess(false);
    } finally {
      setLoading(false);
    }
  }, [resource, action]);

  // Check permission on mount and when dependencies change
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // Function to manually trigger a permission check
  const refresh = () => {
    checkPermission();
  };

  return { canAccess, loading, refresh };
}

export default usePermission;
