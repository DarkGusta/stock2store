
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { toast } from "@/hooks/use-toast";
import { cleanupAuthState } from "@/context/auth";
import { getUserProfile } from "./userProfileService";

export const signIn = async (email: string, password: string) => {
  try {
    console.log("Starting sign in process...");
    
    // Clean up existing auth state to prevent conflicts
    cleanupAuthState();
    
    // Attempt to sign out any existing sessions globally
    try {
      console.log("Attempting global sign out before sign in...");
      await supabase.auth.signOut({ scope: 'global' });
      // Wait a bit for cleanup
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      console.log("Pre-auth signout failed, continuing:", err);
    }
    
    console.log("Attempting to sign in with email/password...");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error("Sign in error:", error);
      
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

    if (data.user) {
      console.log("Sign in successful, user:", data.user.id);
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
        variant: "default"
      });
    }

    return { user: data.user, error: null };
  } catch (error) {
    console.error("Unexpected error during sign in:", error);
    cleanupAuthState();
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
        emailRedirectTo: window.location.origin + '/stock2store/login'
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
    console.log("Starting sign out process...");
    
    // Clean up auth state first
    cleanupAuthState();
    
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    
    if (error) {
      console.error("Sign out error:", error);
      return { error };
    }
    
    console.log("Sign out successful");
    
    // Force page refresh to ensure clean state with correct path
    setTimeout(() => {
      window.location.href = '/stock2store/login';
    }, 200);
    
    return { error: null };
  } catch (error) {
    console.error("Unexpected error during sign out:", error);
    // Force reload anyway to ensure clean state with correct path
    window.location.href = '/stock2store/login';
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

    return getUserProfile(session.user.id);
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
};
