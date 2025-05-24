
import { useState, useEffect } from "react";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Import directly from authUtils since we removed the service index
import { fetchCurrentUser } from "../authUtils";

export interface AuthState {
  user: User | null;
  loading: boolean;
}

export function useAuthState(): [
  AuthState,
  React.Dispatch<React.SetStateAction<User | null>>
] {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Setting up auth state...");
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
          return;
        }
        
        if (session) {
          // Use setTimeout to avoid auth deadlocks
          setTimeout(async () => {
            try {
              console.log("Fetching user data after auth state change...");
              const currentUser = await fetchCurrentUser();
              console.log("User data fetched:", currentUser);
              setUser(currentUser);
            } catch (error) {
              console.error("Error fetching user data:", error);
              setUser(null);
            } finally {
              setLoading(false);
            }
          }, 0);
        }
      }
    );
    
    // Check for existing session
    const checkSession = async () => {
      try {
        console.log("Checking for existing session...");
        const currentUser = await fetchCurrentUser();
        console.log("Current user from session check:", currentUser);
        setUser(currentUser);
      } catch (error) {
        console.error("Error checking session:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return [{ user, loading }, setUser];
}
