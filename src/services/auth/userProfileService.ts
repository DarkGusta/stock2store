
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole } from "@/types";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { getUserProfileFixed } from '@/services/users/userProfileService';

export const getUserProfile = async (supabaseUser: SupabaseUser): Promise<User | null> => {
  try {
    console.log("Getting profile for user:", supabaseUser.id);
    
    // Use the fixed method to get profile
    const profileData = await getUserProfileFixed(supabaseUser.id);

    if (profileData) {
      console.log("Found existing profile:", profileData);
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

    // No profile found, create one
    console.log("No profile found, creating a new profile for user:", supabaseUser.id);
    const name = supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User';
    
    // Default role is 'customer'
    const role: UserRole = 'customer';
    
    try {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: supabaseUser.id,
          name: name,
          email: supabaseUser.email,
          role: role
        });
      
      if (insertError) {
        console.error("Error creating profile:", insertError);
      } else {
        console.log("Successfully created new profile for user:", supabaseUser.id);
      }
    } catch (createError) {
      console.error("Exception when creating profile:", createError);
    }
    
    // Return a default user with the data we tried to insert
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: name,
      role: role,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      createdAt: new Date(supabaseUser.created_at || Date.now()),
      updatedAt: new Date(supabaseUser.updated_at || Date.now())
    };
  } catch (error) {
    console.error("Error in getUserProfile:", error);
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
