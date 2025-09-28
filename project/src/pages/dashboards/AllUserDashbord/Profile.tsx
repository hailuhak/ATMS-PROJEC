import React from 'react';
import { Users } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { User } from '../../../types';

interface ProfileProps {
  currentUser: User | null;
}

export const Profile: React.FC<ProfileProps> = ({ currentUser }) => {
  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          My Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your account information and preferences
        </p>
      </header>

      {/* Profile + Account Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1 bg-white dark:bg-gray-800 shadow-md rounded-lg">
          <CardContent className="flex flex-col items-center text-center p-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <Users className="w-12 h-12 text-white" />
            </div>

            {/* Name + Email */}
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
              {currentUser?.displayName || 'User'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {currentUser?.email || 'No email available'}
            </p>

            {/* Role Badge */}
            <span className="mt-3 px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
              {currentUser?.role === 'user' ? 'General User' : currentUser?.role || 'Unknown Role'}
            </span>

            {/* Action */}
            <Button className="w-full mt-6">Edit Profile</Button>
          </CardContent>
        </Card>

        {/* Account Info Card */}
        <Card className="lg:col-span-2 bg-white dark:bg-gray-800 shadow-md rounded-lg">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Account Information
            </h3>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
<div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
    Full Name
  </label>
  <Input
    value={currentUser?.displayName || ''}
    placeholder="Enter your full name"
    className="
      bg-gray-100 dark:bg-gray-800 
      text-gray-600 dark:text-gray-400 
      border border-gray-200 dark:border-gray-700 
      placeholder-gray-400 dark:placeholder-gray-500
      focus:ring-2 focus:ring-blue-300/40 focus:border-blue-300/40
    "
  />
</div>


{/* Email */}
<div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
    Email
  </label>
  <Input
    value={currentUser?.email || ''}
    disabled
    className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
  />
</div>

{/* Role */}
<div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
    Role
  </label>
  <Input
    value={
      currentUser?.role === 'user'
        ? 'General User'
        : currentUser?.role || 'Unknown'
    }
    disabled
    className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
  />
</div>

            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
