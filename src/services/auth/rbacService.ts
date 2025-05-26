import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types';

// Define fallback permissions for each role when RBAC tables are empty
const FALLBACK_PERMISSIONS: Record<UserRole, { resource: string; action: string }[]> = {
  admin: [
    { resource: 'dashboard', action: 'view' },
    { resource: 'warehouse', action: 'view' },
    { resource: 'warehouse', action: 'manage' },
    { resource: 'store', action: 'view' },
    { resource: 'store', action: 'purchase' },
    { resource: 'analytics', action: 'view' },
    { resource: 'users', action: 'view' },
    { resource: 'users', action: 'manage' },
    { resource: 'profile', action: 'view' },
    { resource: 'profile', action: 'update' },
    { resource: 'settings', action: 'view' },
    { resource: 'settings', action: 'update' },
    { resource: 'cart', action: 'view' },
    { resource: 'cart', action: 'update' },
    { resource: 'returns', action: 'view' },
    { resource: 'returns', action: 'manage' }
  ],
  warehouse: [
    { resource: 'dashboard', action: 'view' },
    { resource: 'warehouse', action: 'view' },
    { resource: 'warehouse', action: 'manage' },
    { resource: 'store', action: 'view' },
    { resource: 'profile', action: 'view' },
    { resource: 'profile', action: 'update' },
    { resource: 'settings', action: 'view' },
    { resource: 'settings', action: 'update' }
  ],
  customer: [
    { resource: 'store', action: 'view' },
    { resource: 'store', action: 'purchase' },
    { resource: 'profile', action: 'view' },
    { resource: 'profile', action: 'update' },
    { resource: 'settings', action: 'view' },
    { resource: 'settings', action: 'update' },
    { resource: 'cart', action: 'view' },
    { resource: 'cart', action: 'update' },
    { resource: 'returns', action: 'view' },
    { resource: 'returns', action: 'manage' }
  ],
  analyst: [
    { resource: 'dashboard', action: 'view' },
    { resource: 'warehouse', action: 'view' },
    { resource: 'store', action: 'view' },
    { resource: 'store', action: 'purchase' },
    { resource: 'analytics', action: 'view' },
    { resource: 'profile', action: 'view' },
    { resource: 'profile', action: 'update' },
    { resource: 'settings', action: 'view' },
    { resource: 'cart', action: 'view' },
    { resource: 'cart', action: 'update' }
  ]
};

/**
 * Checks if RBAC tables are properly initialized
 */
const isRBACInitialized = async (): Promise<boolean> => {
  try {
    // Check if we have any roles and permissions
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('id')
      .limit(1);

    const { data: permissions, error: permissionsError } = await supabase
      .from('permissions')
      .select('id')
      .limit(1);

    if (rolesError || permissionsError) {
      console.log('Error checking RBAC initialization:', rolesError || permissionsError);
      return false;
    }

    return roles && roles.length > 0 && permissions && permissions.length > 0;
  } catch (error) {
    console.error('Error checking RBAC initialization:', error);
    return false;
  }
};

/**
 * Fallback permission check using simple role-based logic
 */
const checkFallbackPermission = (userRole: UserRole, resource: string, action: string): boolean => {
  const rolePermissions = FALLBACK_PERMISSIONS[userRole] || [];
  return rolePermissions.some(perm => perm.resource === resource && perm.action === action);
};

/**
 * Checks if the current user has a specific role
 */
export const hasRole = async (role: UserRole): Promise<boolean> => {
  try {
    // Get the current user session
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return false;
    }

    // Check if user has the role directly from profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    return profile?.role === role;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
};

/**
 * Checks if the current user has permission to perform an action on a resource
 */
export const hasPermission = async (resource: string, action: string): Promise<boolean> => {
  try {
    // Get the current user session
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      console.log('No user session found');
      return false;
    }

    // Get user's role from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!profile?.role) {
      console.log('No user role found in profile');
      return false;
    }

    const userRole = profile.role as UserRole;
    console.log(`Checking permission for ${resource}:${action} for role: ${userRole}`);

    // Check if RBAC system is initialized
    const rbacInitialized = await isRBACInitialized();
    
    if (!rbacInitialized) {
      console.log('RBAC not initialized, using fallback permissions for role:', userRole);
      const result = checkFallbackPermission(userRole, resource, action);
      console.log(`Fallback permission result: ${result}`);
      return result;
    }

    // Use the full RBAC system
    console.log('Using full RBAC system for permission check');
    const { data, error } = await supabase
      .rpc('user_has_permission', {
        user_id: session.user.id,
        req_resource: resource,
        req_action: action
      });

    if (error) {
      console.error('Error checking permissions via RPC:', error);
      // Fallback to simple role-based check if RPC fails
      console.log('Falling back to role-based permissions due to RPC error');
      const result = checkFallbackPermission(userRole, resource, action);
      console.log(`Fallback permission result after RPC error: ${result}`);
      return result;
    }

    console.log(`RPC permission result: ${Boolean(data)}`);
    return Boolean(data);
  } catch (error) {
    console.error('Error checking user permissions:', error);
    // Fallback to denying access on error
    return false;
  }
};

/**
 * Utility function to get all permissions for the current user
 */
export const getUserPermissions = async (): Promise<{resource: string, action: string}[]> => {
  try {
    // Get the current user session
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return [];
    }

    // First get the user's role
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    const userRole = profileData?.role as UserRole || 'customer';

    // Check if RBAC is initialized
    const rbacInitialized = await isRBACInitialized();
    
    if (!rbacInitialized) {
      // Return fallback permissions
      return FALLBACK_PERMISSIONS[userRole] || [];
    }

    // Get permissions from RBAC system
    const { data, error } = await supabase
      .from('permissions')
      .select(`
        resource,
        action,
        role_permissions!inner(
          role_id,
          roles!inner(
            name
          )
        )
      `)
      .eq('role_permissions.roles.name', userRole);

    if (error) {
      console.error('Error fetching user permissions:', error);
      return FALLBACK_PERMISSIONS[userRole] || [];
    }

    return (data || []).map(perm => ({
      resource: perm.resource,
      action: perm.action
    }));
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return [];
  }
};

/**
 * Updates a user's roles
 */
export const assignRoleToUser = async (userId: string, roleName: string): Promise<boolean> => {
  try {
    // First get the role id from the roles table
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', roleName)
      .single();

    if (roleError || !roleData) {
      console.error('Error finding role:', roleError);
      return false;
    }

    // Now update the user's profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: roleName as UserRole })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user role:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error assigning role to user:', error);
    return false;
  }
};

/**
 * Initialize the RBAC system with default roles and permissions
 */
export const initializeRBAC = async (): Promise<boolean> => {
  try {
    // Check if already initialized
    const initialized = await isRBACInitialized();
    if (initialized) {
      console.log('RBAC system already initialized');
      return true;
    }

    console.log('RBAC system not initialized, but this should be handled by the SQL migration');
    return false;
  } catch (error) {
    console.error('Error initializing RBAC system:', error);
    return false;
  }
};

/**
 * Updates a user's role (admin only function)
 */
export const updateUserRole = async (userId: string, newRole: UserRole): Promise<boolean> => {
  try {
    // Get the current user session to verify admin permissions
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      console.error('No user session found');
      return false;
    }

    // Check if current user is admin
    const isAdmin = await hasRole('admin');
    if (!isAdmin) {
      console.error('User is not admin, cannot update roles');
      return false;
    }

    // Update the user's role in profiles table
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user role:', updateError);
      return false;
    }

    console.log(`Successfully updated user ${userId} role to ${newRole}`);
    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    return false;
  }
};
