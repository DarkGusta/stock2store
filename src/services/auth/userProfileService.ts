
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types';

export const getUserProfile = async (user: SupabaseUser): Promise<User | null> => {
  try {
    // Get user profile from the profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      // If no profile exists, create a basic user object
      return {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.email?.split('@')[0] || '',
        role: 'customer' as UserRole,
        createdAt: user.created_at,
        updatedAt: user.updated_at || user.created_at
      };
    }

    // Return user with profile data
    return {
      id: user.id,
      email: user.email || '',
      name: profile.name || user.user_metadata?.name || user.email?.split('@')[0] || '',
      role: profile.role || 'customer' as UserRole,
      createdAt: user.created_at,
      updatedAt: profile.updated_at || user.updated_at || user.created_at
    };
  } catch (error) {
    console.error('Unexpected error in getUserProfile:', error);
    return null;
  }
};
