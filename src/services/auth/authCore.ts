
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { toast } from "@/hooks/use-toast";
import { cleanupAuthState } from "@/context/auth";
import { getUserProfile } from "./userProfileService";

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
      // Check for email confirmation error specifically
      if (error.message.includes("Email not confirmed")) {
        toast({
          title: "Email not confirmed",
          description: "Please check your email for the confirmation link or request a new one.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive"
        });
      }
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
        },
        // Explicitly don't automatically sign in after registration
        emailRedirectTo: window.location.origin + '/login'
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

    // Sign out immediately after registration to prevent automatic login
    await supabase.auth.signOut();

    toast({
      title: "Registration successful",
      description: "Please check your email for confirmation instructions.",
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
    
    // Force reload to ensure clean state after a delay
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
    
    return { error: null };
  } catch (error) {
    console.error("Unexpected error during sign out:", error);
    // Force reload anyway
    window.location.href = '/login';
    return { error };
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Error getting session:", error);
      return null;
    }

    if (!session) return null;

    return getUserProfile(session.user);
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
};
