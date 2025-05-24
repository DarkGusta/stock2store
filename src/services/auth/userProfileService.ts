
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      name: data.name || 'User',
      email: data.email || '',
      role: data.role || 'customer',
      avatar: '',
      createdAt: new Date(data.created_at || Date.now()),
      updatedAt: new Date(data.updated_at || Date.now())
    };
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        name: updates.name,
        email: updates.email,
        role: updates.role,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name || 'User',
      email: data.email || '',
      role: data.role || 'customer',
      avatar: '',
      createdAt: new Date(data.created_at || Date.now()),
      updatedAt: new Date(data.updated_at || Date.now())
    };
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return null;
  }
};
