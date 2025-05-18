
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { cleanupAuthState } from "@/context/AuthContext";

export const getCurrentUser = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error("Error getting session:", error);
    return null;
  }

  if (!session) return null;

  return session.user;
};

export const signIn = async (email: string, password: string) => {
  try {
    // Clean up existing auth state to prevent conflicts
    cleanupAuthState();
    
    // Attempt to sign out any existing sessions
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      // Continue even if this fails
      console.log("Pre-auth signout failed, continuing:", err);
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive"
      });
      return { user: null, error };
    }

    // Successfully signed in
    toast({
      title: "Login successful",
      description: `Welcome back!`,
      variant: "default"
    });

    return { user: data.user, error: null };
  } catch (error) {
    console.error("Unexpected error during sign in:", error);
    toast({
      title: "Login failed",
      description: "An unexpected error occurred",
      variant: "destructive"
    });
    return { user: null, error };
  }
};

export const signUp = async (email: string, password: string, name: string) => {
  try {
    // Clean up existing auth state
    cleanupAuthState();
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });

    if (error) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive"
      });
      return { user: null, error };
    }

    toast({
      title: "Registration successful",
      description: "Welcome to Stock2Store! You can now sign in.",
      variant: "default"
    });

    return { user: data.user, error: null };
  } catch (error) {
    console.error("Unexpected error during sign up:", error);
    return { user: null, error };
  }
};

export const signOut = async () => {
  try {
    // Clean up auth state first
    cleanupAuthState();
    
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    
    if (error) {
      return { error };
    }
    
    // Force reload to ensure clean state
    window.location.href = '/login';
    
    return { error: null };
  } catch (error) {
    console.error("Unexpected error during sign out:", error);
    return { error };
  }
};

// Function to create demo accounts - typically would be used only in development
export const createDemoAccount = async (email: string, password: string, name: string, role: string) => {
  try {
    const { user, error } = await signUp(email, password, name);
    
    if (error) {
      console.error("Failed to create demo account:", error);
      return { user: null, error };
    }
    
    // Make sure role is one of the valid UserRole enum values
    const validRole = role.toLowerCase() as UserRole;
    
    // Update the user's role in the profiles table
    if (user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: validRole })
        .eq('id', user.id);
      
      if (profileError) {
        console.error("Failed to update user role:", profileError);
      }
      
      return { user, error: null };
    } else {
      // This happens when the user already exists but Supabase doesn't return an error
      // Try to find the user by email in the profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();
        
      if (profileData) {
        return { user: { id: profileData.id } as User, error: null };
      }
      
      return { user: null, error: new Error("User creation succeeded but user object is null") };
    }
  } catch (error) {
    console.error("Error creating demo account:", error);
    return { user: null, error };
  }
};

// Function to create all demo accounts with delay to avoid rate limiting
export const createAllDemoAccounts = async (accounts) => {
  const results = {};
  
  for (const account of accounts) {
    try {
      // Try to create the account
      const result = await createDemoAccount(account.email, 'password', account.role + " User", account.role.toLowerCase());
      results[account.email] = !result.error;
      
      // Add delay between account creations to avoid rate limiting
      if (accounts.indexOf(account) < accounts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay between creations
      }
    } catch (err) {
      console.error(`Failed to create ${account.email}:`, err);
      results[account.email] = false;
    }
  }
  
  return results;
}
