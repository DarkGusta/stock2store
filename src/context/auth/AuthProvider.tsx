import React, { useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { signOut as authSignOut } from "@/services/auth/authCore";
import { useAuthState } from "./hooks/useAuthState";
import { initializeRBAC } from "@/services/auth/rbacService";
import { useToast } from "@/hooks/use-toast";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [{ user, loading }, setUser] = useAuthState();
  const { toast } = useToast();

  // Initialize RBAC system
  useEffect(() => {
    if (user && user.role === 'admin') {
      const setupRBAC = async () => {
        try {
          const success = await initializeRBAC();
          if (success) {
            console.log("RBAC system initialized successfully");
          }
        } catch (error) {
          console.error("Error initializing RBAC system:", error);
        }
      };
      
      setupRBAC();
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await authSignOut();
      setUser(null);
    } catch (error) {
      console.error("Error during sign out:", error);
      toast({
        title: "Sign out failed",
        description: "An error occurred while signing out. Please try again.",
        variant: "destructive",
      });
    }
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
