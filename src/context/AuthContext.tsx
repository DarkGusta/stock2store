
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

// Helper function to determine the role based on email for demo accounts
const getRoleFromEmail = (email: string): UserRole => {
  if (email.includes('admin')) return 'admin';
  if (email.includes('warehouse')) return 'warehouse';
  if (email.includes('analyst')) return 'analyst';
  return 'customer';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

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
                
                // Ensure the role is correct based on email for demo accounts
                const expectedRole = session.user.email 
                  ? getRoleFromEmail(session.user.email) 
                  : profile.role as UserRole;
                
                setUser({
                  id: session.user.id,
                  name: profile.name || 'User',
                  email: session.user.email || '',
                  role: expectedRole, // Use expected role based on email
                  createdAt: new Date(profile.created_at),
                  updatedAt: new Date(profile.updated_at)
                });
              } else if (error) {
                console.error('Error fetching user profile:', error);
                // Create a default user object with minimal info when profile isn't found
                const defaultRole = session.user.email 
                  ? getRoleFromEmail(session.user.email)
                  : 'customer' as UserRole;
                
                setUser({
                  id: session.user.id,
                  name: session.user.user_metadata?.name || 'User',
                  email: session.user.email || '',
                  role: defaultRole, // Default role based on email
                  createdAt: new Date(),
                  updatedAt: new Date()
                });
              } else {
                // No profile found but also no error (null result)
                console.log("No profile found for user, creating default user object");
                const defaultRole = session.user.email 
                  ? getRoleFromEmail(session.user.email)
                  : 'customer' as UserRole;
                
                setUser({
                  id: session.user.id,
                  name: session.user.user_metadata?.name || 'User',
                  email: session.user.email || '',
                  role: defaultRole, // Default role based on email
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
            
            // Ensure the role is correct based on email for demo accounts
            const expectedRole = session.user.email 
              ? getRoleFromEmail(session.user.email) 
              : profile.role as UserRole;
              
            setUser({
              id: session.user.id,
              name: profile.name || 'User',
              email: session.user.email || '',
              role: expectedRole, // Use expected role based on email
              createdAt: new Date(profile.created_at),
              updatedAt: new Date(profile.updated_at)
            });
          } else {
            console.log("No profile found or error fetching profile, using default user data");
            // Create a default user object when profile isn't found
            const defaultRole = session.user.email 
              ? getRoleFromEmail(session.user.email)
              : 'customer' as UserRole;
              
            setUser({
              id: session.user.id,
              name: session.user.user_metadata?.name || 'User',
              email: session.user.email || '',
              role: defaultRole, // Default role based on email
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
        setAuthInitialized(true);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setLoading(true); // Set loading state to prevent redirects during signout
      
      // Clean up auth state first
      cleanupAuthState();
      
      try {
        // Attempt global sign out
        await supabase.auth.signOut({ scope: 'global' });
      } catch (error) {
        console.error('Error during sign out:', error);
      }
      
      setUser(null);
      setSession(null);
      
      // Force a page reload for a clean state after a small delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    } catch (error) {
      console.error('Error during sign out process:', error);
      // Force reload anyway as fallback
      window.location.href = '/login';
    }
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
