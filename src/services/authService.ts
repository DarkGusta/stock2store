
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { toast } from "@/components/ui/use-toast";

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

    return { user: data.user, error: null };
  } catch (error) {
    console.error("Unexpected error during sign in:", error);
    toast({
      title: "Login failed",
      description: "An unexpected error occurred. Please try again.",
      variant: "destructive"
    });
    return { user: null, error };
  }
};

export const signUp = async (email: string, password: string, name: string) => {
  try {
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
    toast({
      title: "Registration failed",
      description: "An unexpected error occurred. Please try again.",
      variant: "destructive"
    });
    return { user: null, error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
    
    toast({
      title: "Signed out successfully",
      variant: "default"
    });
    
    return { error: null };
  } catch (error) {
    console.error("Unexpected error during sign out:", error);
    toast({
      title: "Sign out failed",
      description: "An unexpected error occurred. Please try again.",
      variant: "destructive"
    });
    return { error };
  }
};
