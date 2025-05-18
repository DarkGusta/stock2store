
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/types';

interface UserProfileProps {
  user: User;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  return (
    <div className="flex items-center space-x-3 mb-6">
      <Avatar>
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div>
        <p className="text-sm font-medium">{user.name}</p>
        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
      </div>
    </div>
  );
};

export default UserProfile;
