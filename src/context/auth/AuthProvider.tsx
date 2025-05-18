
import React, { useState, useEffect } from "react";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { signOut as authSignOut } from "@/services/auth";
import { AuthContext } from "./AuthContext";
import { fetchCurrentUser } from "./authUtils";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Setting up auth context...");
    
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
              const currentUser = await fetchCurrentUser();
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
        const currentUser = await fetchCurrentUser();
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

  const handleSignOut = async () => {
    setLoading(true);
    await authSignOut();
    setUser(null);
    setLoading(false);
  };

  const value = {
    user,
    loading,
    signOut: handleSignOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
