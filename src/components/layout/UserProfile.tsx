
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface UserProfileProps {
  user: User;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single();

        if (!error && data?.avatar_url) {
          setAvatarUrl(data.avatar_url);
        }
      } catch (error) {
        console.error('Error fetching avatar:', error);
      }
    };

    fetchAvatar();
  }, [user.id]);

  // Generate initials from user name, defaulting to "US" if none available
  const initials = user.name 
    ? user.name.substring(0, 2).toUpperCase() 
    : user.email 
      ? user.email.substring(0, 2).toUpperCase() 
      : "US";
      
  return (
    <div className="flex items-center space-x-3 mb-6">
      <Avatar>
        <AvatarImage src={avatarUrl || user.avatar} alt={user.name || 'User'} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div>
        <p className="text-sm font-medium">{user.name || user.email || 'User'}</p>
        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
      </div>
    </div>
  );
};

export default UserProfile;
