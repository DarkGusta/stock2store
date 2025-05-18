
import { User } from "@/types";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export const defaultAuthContext: AuthContextType = {
  user: null,
  loading: true,
  signOut: async () => {}
};
