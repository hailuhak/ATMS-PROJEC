import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Activity,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { RecentActivity } from '../../components/dashboard/RecentActivity';
import { CourseCard } from '../../components/courses/CourseCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { orderBy, limit } from 'firebase/firestore';
import { Course } from '../../types';

interface AdminDashboardProps {
  activeSection: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeSection }) => {
  const { data: courses, loading: coursesLoading } = useFirestoreQuery<Course>('courses', [
    orderBy('createdAt', 'desc'),
    limit(10)
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || course.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const renderDashboardOverview = () => (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your audit training system
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Quick Action
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value="2,847"
          change="12.3%"
          changeType="increase"
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Active Courses"
          value="24"
          change="8.1%"
          changeType="increase"
          icon={BookOpen}
          color="green"
        />
        <StatsCard
          title="Completion Rate"
          value="87.2%"
          change="2.4%"
          changeType="increase"
          icon={TrendingUp}
          color="yellow"
        />
        <StatsCard
          title="Monthly Sessions"
          value="1,249"
          change="15.8%"
          changeType="increase"
          icon={Activity}
          color="purple"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Courses Overview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Courses
                </h3>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coursesLoading ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48"></div>
                    </div>
                  ))
                ) : (
                  filteredCourses.slice(0, 4).map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      showActions={false}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <RecentActivity />
        </div>
      </div>
    </div>
  );

  const renderCourseManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Course Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all courses in your system
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Course
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coursesLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64"></div>
            </div>
          ))
        ) : (
          filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={() => console.log('Edit course:', course.id)}
              onView={() => console.log('View course:', course.id)}
            />
          ))
        )}
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage users and their roles
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card>
        <CardContent>
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              User management interface coming soon...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Analytics & Reports
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View system performance and insights
        </p>
      </div>

      <Card>
        <CardContent>
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Analytics dashboard coming soon...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderActivityLogs = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Activity Logs
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Monitor system activities and user actions
        </p>
      </div>

      <RecentActivity />
    </div>
  );

  switch (activeSection) {
    case 'users':
      return renderUserManagement();
    case 'courses':
      return renderCourseManagement();
    case 'analytics':
      return renderAnalytics();
    case 'activities':
      return renderActivityLogs();
    default:
      return renderDashboardOverview();
  }
};