
import { supabase } from '@/integrations/supabase/client';

/**
 * Fix for userProfileService to handle 406 errors from Supabase
 */
export const getUserProfileFixed = async (userId: string) => {
  try {
    // Try to get multiple profiles with a filter instead of using .single()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId);
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.log('No profile found for user:', userId);
      return null;
    }
    
    // Return the first profile found
    return data[0];
  } catch (error) {
    console.error('Unexpected error fetching user profile:', error);
    return null;
  }
};
