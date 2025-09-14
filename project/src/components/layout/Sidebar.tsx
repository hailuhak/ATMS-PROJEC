import React from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  BookOpen, 
  Users, 
  Calendar, 
  BarChart3, 
  FileText,
  UserCheck,
  GraduationCap 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { clsx } from 'clsx';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const { currentUser } = useAuth();

  const getMenuItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
    ];

    // switch (currentUser?.role) {
    //   case 'admin':
    //     return [
    //       ...baseItems,
    //       { id: 'users', label: 'User Management', icon: Users },
    //       { id: 'courses', label: 'Course Management', icon: BookOpen },
    //       { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    //       { id: 'activities', label: 'Activity Logs', icon: FileText },
//     ];
    switch (currentUser?.role) {
  case 'admin':
    return [
      ...baseItems,
      { id: 'users', label: 'User Management', icon: Users },
      { id: 'pending-users', label: 'Pending Users', icon: UserCheck }, // <-- new
      { id: 'courses', label: 'Course Management', icon: BookOpen },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'activities', label: 'Activity Logs', icon: FileText },
    ];

      case 'trainer':
        return [
          ...baseItems,
          { id: 'courses', label: 'My Courses', icon: BookOpen },
          { id: 'sessions', label: 'Training Sessions', icon: Calendar },
          { id: 'attendance', label: 'Attendance', icon: UserCheck },
          { id: 'materials', label: 'Materials', icon: FileText },
        ];
      case 'trainee':
        return [
          ...baseItems,
          { id: 'courses', label: 'My Courses', icon: GraduationCap },
          { id: 'progress', label: 'Progress', icon: BarChart3 },
          { id: 'schedule', label: 'Schedule', icon: Calendar },
          { id: 'resources', label: 'Resources', icon: FileText },
          { id: 'pending-users', label: 'Pending Users', icon: UserCheck },

        ];
      default:
        return [
          ...baseItems,
          { id: 'courses', label: 'Browse Courses', icon: BookOpen },
          { id: 'profile', label: 'Profile', icon: Users },
        ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <motion.aside 
      className="w-64 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 min-h-screen"
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-6">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={clsx(
                'w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors',
                activeSection === item.id
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                  : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </motion.button>
          ))}
        </nav>
      </div>
    </motion.aside>
  );
};