
import { useState, useEffect, useRef } from "react";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { fetchCurrentUser, cleanupAuthState } from "../authUtils";

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
  const initializingRef = useRef(false);
  const lastSessionRef = useRef<string | null>(null);

  useEffect(() => {
    if (initializingRef.current) return;
    initializingRef.current = true;
    
    console.log("Initializing auth state...");
    
    // Set up auth state listener with improved logic
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session ? "with session" : "no session");
        
        // Prevent duplicate processing of the same session
        const sessionKey = session ? `${session.user.id}-${session.access_token.substring(0, 10)}` : null;
        if (sessionKey === lastSessionRef.current && event !== 'SIGNED_OUT') {
          console.log("Duplicate session event, skipping...");
          return;
        }
        lastSessionRef.current = sessionKey;
        
        if (event === 'SIGNED_OUT' || !session) {
          console.log("User signed out or no session");
          setUser(null);
          setLoading(false);
          if (event === 'SIGNED_OUT') {
            cleanupAuthState();
          }
          return;
        }
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Use setTimeout to prevent auth deadlocks
          setTimeout(async () => {
            try {
              console.log("Processing sign in/token refresh...");
              const currentUser = await fetchCurrentUser();
              console.log("User data fetched:", currentUser ? "success" : "failed");
              setUser(currentUser);
            } catch (error) {
              console.error("Error fetching user data:", error);
              setUser(null);
              cleanupAuthState();
            } finally {
              setLoading(false);
            }
          }, 100);
        }
      }
    );
    
    // Check for existing session with timeout
    const checkSession = async () => {
      try {
        console.log("Checking for existing session...");
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Session check timeout')), 5000);
        });
        
        const sessionPromise = fetchCurrentUser();
        const currentUser = await Promise.race([sessionPromise, timeoutPromise]) as User | null;
        
        console.log("Session check result:", currentUser ? "user found" : "no user");
        setUser(currentUser);
      } catch (error) {
        console.error("Error checking session:", error);
        setUser(null);
        cleanupAuthState();
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
    
    return () => {
      console.log("Cleaning up auth state listener");
      subscription.unsubscribe();
      initializingRef.current = false;
    };
  }, []);

  return [{ user, loading }, setUser];
}
