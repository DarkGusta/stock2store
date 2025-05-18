
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
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
    const { data, error } = await signUp(email, password, name);
    
    if (error || !data.user) {
      console.error("Failed to create demo account:", error);
      return { user: null, error };
    }
    
    // Update the user's role in the profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', data.user.id);
    
    if (profileError) {
      console.error("Failed to update user role:", profileError);
    }
    
    return { user: data.user, error: null };
  } catch (error) {
    console.error("Error creating demo account:", error);
    return { user: null, error };
  }
};
