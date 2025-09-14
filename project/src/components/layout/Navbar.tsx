// import React from 'react';
// import { motion } from 'framer-motion';
// import { Bell, Search, User, LogOut, Settings, Sun, Moon } from 'lucide-react';
// import { useAuth } from '../../contexts/AuthContext';
// import { useTheme } from '../../contexts/ThemeContext';
// import { Button } from '../ui/Button';

// export const Navbar: React.FC = () => {
//   const { currentUser, logout } = useAuth();
//   const { theme, toggleTheme } = useTheme();

//   const handleLogout = async () => {
//     try {
//       await logout();
//     } catch (error) {
//       console.error('Failed to logout:', error);
//     }
//   };

//   return (
//     <motion.nav 
//       className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"
//       initial={{ y: -100 }}
//       animate={{ y: 0 }}
//       transition={{ duration: 0.3 }}
//     >
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           {/* Logo */}
//           <div className="flex items-center">
//             <motion.div 
//               className="flex-shrink-0"
//               whileHover={{ scale: 1.05 }}
//             >
//               <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
//                 ATMS
//               </h1>
//             </motion.div>
//           </div>

//           {/* Search */}
//           <div className="flex-1 max-w-lg mx-8">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//               <input
//                 type="text"
//                 placeholder="Search courses, users..."
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
//               />
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="flex items-center space-x-4">
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={toggleTheme}
//             >
//               {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
//             </Button>

//             <Button variant="ghost" size="sm">
//               <Bell className="w-4 h-4" />
//             </Button>

//             <Button variant="ghost" size="sm">
//               <Settings className="w-4 h-4" />
//             </Button>

//             <div className="flex items-center space-x-3">
//               <div className="text-right">
//                 <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                   {currentUser?.displayName || currentUser?.email}
//                 </p>
//                 <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
//                   {currentUser?.role}
//                 </p>
//               </div>
              
//               <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
//                 <User className="w-4 h-4 text-white" />
//               </div>
//             </div>

//             <Button variant="ghost" size="sm" onClick={handleLogout}>
//               <LogOut className="w-4 h-4" />
//             </Button>
//           </div>
//         </div>
//       </div>
//     </motion.nav>
//   );
// };




import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, User, LogOut, Settings, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../ui/Button';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = React.useState<number>(0);

  // Listen to pendingUsers collection for real-time notifications
  React.useEffect(() => {
    const q = query(collection(db, 'pendingUsers'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.size); // badge shows number of pending users
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <motion.nav 
      className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <motion.div 
              className="flex-shrink-0"
              whileHover={{ scale: 1.05 }}
            >
              <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ATMS
              </h1>
            </motion.div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search courses, users..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            
            {/* Theme Toggle */}
            <Button variant="ghost" size="sm" onClick={toggleTheme}>
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm">
              <div className="relative">
                <Bell className="w-4 h-4" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                    {notifications}
                  </span>
                )}
              </div>
            </Button>

            {/* Settings */}
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>

            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {currentUser?.displayName || currentUser?.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {currentUser?.role}
                </p>
              </div>
              
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Logout */}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>

          </div>
        </div>
      </div>
    </motion.nav>
  );
};
