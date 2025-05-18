
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types";
import { signUp } from "./authCore";

export const createDemoAccount = async (email: string, password: string, name: string, role: string) => {
  try {
    const { user, error } = await signUp(email, password, name);
    
    if (error) {
      console.error("Failed to create demo account:", error);
      return { user: null, error };
    }
    
    // Make sure role is one of the valid UserRole enum values
    let validRole: UserRole = 'customer';
    
    if (role === 'admin') validRole = 'admin';
    else if (role === 'warehouse') validRole = 'warehouse';
    else if (role === 'analyst') validRole = 'analyst';
    else validRole = 'customer';
    
    // Update the user's role in the profiles table
    if (user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: validRole })
        .eq('id', user.id);
      
      if (profileError) {
        console.error("Failed to update user role:", profileError);
      }
      
      return { user, error: null };
    } else {
      // This happens when the user already exists but Supabase doesn't return an error
      // Try to find the user by email in the profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();
        
      if (profileData) {
        // Ensure the role is set correctly
        await supabase
          .from('profiles')
          .update({ role: validRole })
          .eq('email', email);
          
        return { user: { id: profileData.id } as any, error: null };
      }
      
      return { user: null, error: new Error("User creation succeeded but user object is null") };
    }
  } catch (error) {
    console.error("Error creating demo account:", error);
    return { user: null, error };
  }
};

// Function to create all demo accounts with delay to avoid rate limiting
export const createAllDemoAccounts = async (accounts: any[]) => {
  const results: Record<string, boolean> = {};
  
  for (const account of accounts) {
    try {
      // Try to create the account with the correct role
      const result = await createDemoAccount(
        account.email, 
        'password', 
        account.role + " User", 
        account.role.toLowerCase()
      );
      
      results[account.email] = !result.error;
      
      // Add delay between account creations to avoid rate limiting
      if (accounts.indexOf(account) < accounts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay between creations
      }
    } catch (err) {
      console.error(`Failed to create ${account.email}:`, err);
      results[account.email] = false;
    }
  }
  
  return results;
};
