
import React from "react";
import { AuthContext } from "./AuthContext";
import { signOut as authSignOut } from "@/services/auth";
import { useAuthState } from "./hooks/useAuthState";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [{ user, loading }, setUser] = useAuthState();

  const handleSignOut = async () => {
    try {
      await authSignOut();
      setUser(null);
    } catch (error) {
      console.error("Error during sign out:", error);
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
