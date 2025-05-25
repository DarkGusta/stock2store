
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { getUserProfile } from "@/services/auth/userProfileService";

// Enhanced function to clean up auth state completely
export const cleanupAuthState = () => {
  console.log("Cleaning up auth state...");
  
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      console.log(`Removing localStorage key: ${key}`);
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      console.log(`Removing sessionStorage key: ${key}`);
      sessionStorage.removeItem(key);
    }
  });
  
  // Clear any other potential auth-related storage
  localStorage.removeItem('sb-access-token');
  localStorage.removeItem('sb-refresh-token');
  sessionStorage.removeItem('sb-access-token');
  sessionStorage.removeItem('sb-refresh-token');
};

// Function to fetch the current user with better error handling
export const fetchCurrentUser = async (): Promise<User | null> => {
  try {
    console.log("Fetching current user...");
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Error getting session:", error);
      // Clean up on session error
      cleanupAuthState();
      return null;
    }

    if (!session) {
      console.log("No active session found");
      return null;
    }

    console.log("Active session found, fetching user profile...");
    const userProfile = await getUserProfile(session.user.id);
    
    if (!userProfile) {
      console.error("User profile not found, cleaning up auth state");
      cleanupAuthState();
      return null;
    }
    
    return userProfile;
  } catch (error) {
    console.error("Error in fetchCurrentUser:", error);
    cleanupAuthState();
    return null;
  }
};
