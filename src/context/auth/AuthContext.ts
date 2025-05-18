
import { createContext, useContext } from "react";
import { AuthContextType, defaultAuthContext } from "./types";

// Create the Auth Context
export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

// Auth context hook
export const useAuth = () => {
  return useContext(AuthContext);
};
