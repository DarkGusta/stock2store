
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types';

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
    // This uses the existing user_role approach
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
      return false;
    }

    // Use the security definer function directly via RPC
    // Fix: Add type annotation to make TypeScript recognize the parameters
    const { data, error } = await supabase
      .rpc<boolean>('user_has_permission', {
        user_id: session.user.id,
        req_resource: resource,
        req_action: action
      });

    if (error) {
      console.error('Error checking permissions:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Error checking user permissions:', error);
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
    
    const userRole = profileData?.role || 'customer';

    // Then get all permissions for that role
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
      return [];
    }

    // Extract the permissions
    const permissions = (data || []).map(perm => ({
      resource: perm.resource,
      action: perm.action
    }));

    return permissions;
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
    // We're casting roleName to UserRole to satisfy TypeScript
    // This is safe as long as roleName matches one of the enum values
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
 * This should be run once during setup or when migrating from the enum-based system
 */
export const initializeRBAC = async (): Promise<boolean> => {
  try {
    // First check if roles already exist
    const { data: existingRoles } = await supabase
      .from('roles')
      .select('*');

    if (existingRoles && existingRoles.length > 0) {
      console.log('RBAC system already initialized');
      return true;
    }

    // Define the default roles
    const roles = [
      { name: 'admin', description: 'Full system access' },
      { name: 'warehouse', description: 'Warehouse management access' },
      { name: 'customer', description: 'Customer access to shopping and orders' },
      { name: 'analyst', description: 'Read-only access to analytics data' }
    ];

    // Insert the roles
    const { error: rolesError } = await supabase
      .from('roles')
      .insert(roles);

    if (rolesError) {
      console.error('Error creating roles:', rolesError);
      return false;
    }

    // Define basic permissions
    const permissions = [
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
      { resource: 'returns', action: 'manage' }
    ];

    // Insert the permissions
    const { error: permissionsError } = await supabase
      .from('permissions')
      .insert(permissions);

    if (permissionsError) {
      console.error('Error creating permissions:', permissionsError);
      return false;
    }

    // Now fetch the created roles and permissions to establish the connections
    const { data: roleIds } = await supabase.from('roles').select('id, name');
    const { data: permissionIds } = await supabase.from('permissions').select('id, resource, action');

    if (!roleIds || !permissionIds) {
      console.error('Error fetching role or permission IDs');
      return false;
    }

    // Define role-permission mappings
    const rolePermissionMappings: { role_id: string, permission_id: string }[] = [];

    // Admin role - all permissions
    const adminRole = roleIds.find(r => r.name === 'admin');
    if (adminRole) {
      permissionIds.forEach(p => {
        rolePermissionMappings.push({
          role_id: adminRole.id,
          permission_id: p.id
        });
      });
    }

    // Warehouse role
    const warehouseRole = roleIds.find(r => r.name === 'warehouse');
    if (warehouseRole) {
      permissionIds.forEach(p => {
        if (['dashboard', 'warehouse', 'profile', 'settings'].includes(p.resource)) {
          rolePermissionMappings.push({
            role_id: warehouseRole.id,
            permission_id: p.id
          });
        }
      });
    }

    // Customer role
    const customerRole = roleIds.find(r => r.name === 'customer');
    if (customerRole) {
      permissionIds.forEach(p => {
        if (['store', 'profile', 'settings', 'cart', 'returns'].includes(p.resource)) {
          rolePermissionMappings.push({
            role_id: customerRole.id,
            permission_id: p.id
          });
        }
      });
    }

    // Analyst role
    const analystRole = roleIds.find(r => r.name === 'analyst');
    if (analystRole) {
      permissionIds.forEach(p => {
        if (['dashboard', 'warehouse', 'analytics', 'profile', 'settings'].includes(p.resource) && p.action === 'view') {
          rolePermissionMappings.push({
            role_id: analystRole.id,
            permission_id: p.id
          });
        }
      });
    }

    // Insert the role-permission mappings
    const { error: mappingError } = await supabase
      .from('role_permissions')
      .insert(rolePermissionMappings);

    if (mappingError) {
      console.error('Error creating role-permission mappings:', mappingError);
      return false;
    }

    console.log('RBAC system successfully initialized');
    return true;
  } catch (error) {
    console.error('Error initializing RBAC system:', error);
    return false;
  }
};
