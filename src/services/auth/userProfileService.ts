import { supabase } from "@/integrations/supabase/client";
import { User, UserRole } from "@/types";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { getUserProfileFixed } from '@/services/databaseService';

// Helper function to get role based on email
export const getRoleFromEmail = (email: string): UserRole => {
  if (email.includes('admin')) return 'admin';
  if (email.includes('warehouse')) return 'warehouse';
  if (email.includes('analyst')) return 'analyst';
  return 'customer';
};

export const getUserProfile = async (supabaseUser: SupabaseUser): Promise<User | null> => {
  try {
    // Use the fixed method to get profile
    const profileData = await getUserProfileFixed(supabaseUser.id);

    if (profileData) {
      // Generate avatar URL since it doesn't exist in the profiles table
      const name = profileData.name || 'User';
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: name,
        role: profileData.role as UserRole || 'customer',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        createdAt: new Date(profileData.created_at || Date.now()),
        updatedAt: new Date(profileData.updated_at || Date.now())
      };
    }

    // Create a default user if profile doesn't exist
    const name = supabaseUser.user_metadata?.name || 'User';
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: name,
      role: getRoleFromEmail(supabaseUser.email || ''),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      createdAt: new Date(supabaseUser.created_at || Date.now()),
      updatedAt: new Date(supabaseUser.updated_at || Date.now())
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const updateUserRole = async (userId: string, role: UserRole): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);
    
    return !error;
  } catch (error) {
    console.error("Error updating user role:", error);
    return false;
  }
};
