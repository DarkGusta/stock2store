
import React, { createContext, useContext, useState, useEffect } from "react";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole } from "@/types";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {}
});

// Helper function to clean up auth state to prevent auth limbo
export const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Setting up auth context...");
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        setSession(session);
        
        if (session?.user) {
          // Fetch additional user data from profiles table via setTimeout
          // to prevent auth deadlock
          setTimeout(async () => {
            try {
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle(); // Use maybeSingle instead of single to avoid errors
                
              if (!error && profile) {
                console.log("Profile fetched successfully:", profile);
                setUser({
                  id: session.user.id,
                  name: profile.name || 'User',
                  email: session.user.email || '',
                  role: profile.role as UserRole,
                  createdAt: new Date(profile.created_at),
                  updatedAt: new Date(profile.updated_at)
                });
              } else if (error) {
                console.error('Error fetching user profile:', error);
                // Create a default user object with minimal info when profile isn't found
                setUser({
                  id: session.user.id,
                  name: session.user.user_metadata?.name || 'User',
                  email: session.user.email || '',
                  role: 'customer' as UserRole, // Default role
                  createdAt: new Date(),
                  updatedAt: new Date()
                });
              } else {
                // No profile found but also no error (null result)
                console.log("No profile found for user, creating default user object");
                setUser({
                  id: session.user.id,
                  name: session.user.user_metadata?.name || 'User',
                  email: session.user.email || '',
                  role: 'customer' as UserRole, // Default role
                  createdAt: new Date(),
                  updatedAt: new Date()
                });
              }
            } catch (error) {
              console.error('Error in auth state change:', error);
              setUser(null);
            } finally {
              setLoading(false);
            }
          }, 0);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        console.log("Initializing auth...");
        const { data: { session } } = await supabase.auth.getSession();
        
        setSession(session);

        if (session?.user) {
          console.log("Found existing session for user:", session.user.id);
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle(); // Use maybeSingle instead of single
            
          if (!error && profile) {
            console.log("Profile found for existing session:", profile);
            setUser({
              id: session.user.id,
              name: profile.name || 'User',
              email: session.user.email || '',
              role: profile.role as UserRole,
              createdAt: new Date(profile.created_at),
              updatedAt: new Date(profile.updated_at)
            });
          } else {
            console.log("No profile found or error fetching profile, using default user data");
            // Create a default user object when profile isn't found
            setUser({
              id: session.user.id,
              name: session.user.user_metadata?.name || 'User',
              email: session.user.email || '',
              role: 'customer' as UserRole, // Default role
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
        } else {
          console.log("No existing session found");
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    // Clean up auth state first
    cleanupAuthState();
    
    try {
      // Attempt global sign out (fallback if it fails)
      await supabase.auth.signOut({ scope: 'global' });
    } catch (error) {
      console.error('Error during sign out:', error);
    }
    
    setUser(null);
    setSession(null);
    
    // Force a page reload for a clean state
    window.location.href = '/login';
  };

  const value = {
    user,
    session,
    loading,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
