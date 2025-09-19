import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  Award,
  Search,
  Filter,
  Star
} from 'lucide-react';
import { StatsCard } from '../../../components/Cards/StatsCard';
import { CourseCard } from '../../../components/courses/CourseCard';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { useAuth } from '../../../contexts/AuthContext';

interface UserDashboardProps {
  activeSection: string;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ activeSection }) => {
  const { currentUser } = useAuth();

  const sampleCourses = [
    {
      id: '1',
      title: 'Introduction to Auditing',
      description: 'A comprehensive introduction to auditing principles and practices.',
      instructorId: 'instructor1',
      instructorName: 'Dr. Emily Wilson',
      duration: 20,
      level: 'beginner' as const,
      category: 'Fundamentals',
      maxParticipants: 50,
      currentParticipants: 35,
      startDate: new Date('2024-01-10'),
      endDate: new Date('2024-02-10'),
      materials: [],
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      title: 'Digital Audit Tools',
      description: 'Learn to use modern digital tools for efficient auditing.',
      instructorId: 'instructor2',
      instructorName: 'Prof. James Rodriguez',
      duration: 25,
      level: 'intermediate' as const,
      category: 'Technology',
      maxParticipants: 30,
      currentParticipants: 22,
      startDate: new Date('2024-01-20'),
      endDate: new Date('2024-02-20'),
      materials: [],
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      title: 'Ethics in Auditing',
      description: 'Understanding ethical principles and professional conduct in auditing.',
      instructorId: 'instructor3',
      instructorName: 'Dr. Maria Garcia',
      duration: 15,
      level: 'beginner' as const,
      category: 'Ethics',
      maxParticipants: 40,
      currentParticipants: 28,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-02-05'),
      materials: [],
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const renderDashboardOverview = () => (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl p-8 text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome, {currentUser?.displayName?.split(' ')[0] || 'User'}!
            </h1>
            <p className="text-blue-100 text-lg">
              Discover audit training courses to advance your career
            </p>
          </div>
          <div className="hidden md:block">
            <BookOpen className="w-20 h-20 text-blue-200" />
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Available Courses"
          value="24"
          change="3 new this week"
          changeType="increase"
          icon={BookOpen}
          color="blue"
        />
        <StatsCard
          title="Expert Instructors"
          value="12"
          change="Certified professionals"
          changeType="neutral"
          icon={Users}
          color="green"
        />
        <StatsCard
          title="Success Rate"
          value="96%"
          change="Student completion rate"
          changeType="increase"
          icon={Award}
          color="yellow"
        />
      </div>

      {/* Featured Courses */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Featured Courses
            </h3>
            <Button variant="outline">View All Courses</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEnroll={() => console.log('Enroll in:', course.title)}
                onView={() => console.log('View details:', course.title)}
                showActions={true}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderBrowseCourses = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Browse Courses
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Discover audit training courses that match your interests
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search courses, topics, instructors..."
              />
            </div>
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option>All Categories</option>
              <option>Fundamentals</option>
              <option>Risk Management</option>
              <option>Technology</option>
              <option>Ethics</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option>All Levels</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onEnroll={() => console.log('Enroll in:', course.title)}
            onView={() => console.log('View details:', course.title)}
            showActions={true}
          />
        ))}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          My Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="text-center">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {currentUser?.displayName || 'User'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {currentUser?.email}
            </p>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 mb-4">
              {currentUser?.role === 'user' ? 'General User' : currentUser?.role}
            </div>
            <Button className="w-full">Edit Profile</Button>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Account Information
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <Input 
                  value={currentUser?.displayName || ''}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <Input 
                  value={currentUser?.email || ''}
                  type="email"
                  disabled
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <Input 
                value={currentUser?.role === 'user' ? 'General User' : currentUser?.role || ''}
                disabled
              />
            </div>
            <div className="pt-4">
              <Button>Save Changes</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  switch (activeSection) {
    case 'courses':
      return renderBrowseCourses();
    case 'profile':
      return renderProfile();
    default:
      return renderDashboardOverview();
  }
};