import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Calendar, 
  Users, 
  TrendingUp,
  Plus,
  Upload,
  CheckSquare
} from 'lucide-react';
import { StatsCard } from '../../components/Cards/StatsCard';
import { RecentActivity } from '../../components/Cards/RecentActivity';
import { CourseCard } from '../../components/courses/CourseCard';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { useAuth } from '../../contexts/AuthContext';
import { where, orderBy, limit } from 'firebase/firestore';
import { Course } from '../../types';

interface TrainerDashboardProps {
  activeSection: string;
}

export const TrainerDashboard: React.FC<TrainerDashboardProps> = ({ activeSection }) => {
  const { currentUser } = useAuth();
  
  const { data: myCourses, loading: coursesLoading } = useFirestoreQuery<Course>('courses', [
    where('instructorId', '==', currentUser?.uid || ''),
    orderBy('createdAt', 'desc'),
    limit(10)
  ]);

  const renderDashboardOverview = () => (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Trainer Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back, {currentUser?.displayName || 'Trainer'}
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Course
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="My Courses"
          value={myCourses.length.toString()}
          change="2 new this month"
          changeType="increase"
          icon={BookOpen}
          color="blue"
        />
        <StatsCard
          title="Active Sessions"
          value="8"
          change="3 this week"
          changeType="increase"
          icon={Calendar}
          color="green"
        />
        <StatsCard
          title="Total Students"
          value="156"
          change="23 new enrollments"
          changeType="increase"
          icon={Users}
          color="yellow"
        />
        <StatsCard
          title="Completion Rate"
          value="94.2%"
          change="5.3% improvement"
          changeType="increase"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  My Courses
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
                ) : myCourses.length === 0 ? (
                  <div className="col-span-2 text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      You haven't created any courses yet.
                    </p>
                    <Button className="mt-4">
                      Create Your First Course
                    </Button>
                  </div>
                ) : (
                  myCourses.slice(0, 4).map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onEdit={() => console.log('Edit course:', course.id)}
                      onView={() => console.log('View course:', course.id)}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <RecentActivity />
        </div>
      </div>
    </div>
  );

  const renderMyCourses = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Courses
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your training courses
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create New Course
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coursesLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64"></div>
            </div>
          ))
        ) : myCourses.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No courses created yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Create your first course to start teaching and managing students.
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Course
            </Button>
          </div>
        ) : (
          myCourses.map((course) => (
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

  const renderTrainingSessions = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Training Sessions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Schedule and manage your training sessions
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Schedule Session
        </Button>
      </div>

      <Card>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Session management interface coming soon...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAttendance = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Attendance Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track student attendance across sessions
        </p>
      </div>

      <Card>
        <CardContent>
          <div className="text-center py-12">
            <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Attendance tracking coming soon...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMaterials = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Training Materials
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Upload and manage course materials
          </p>
        </div>
        <Button>
          <Upload className="w-4 h-4 mr-2" />
          Upload Material
        </Button>
      </div>

      <Card>
        <CardContent>
          <div className="text-center py-12">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Material management coming soon...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  switch (activeSection) {
    case 'courses':
      return renderMyCourses();
    case 'sessions':
      return renderTrainingSessions();
    case 'attendance':
      return renderAttendance();
    case 'materials':
      return renderMaterials();
    default:
      return renderDashboardOverview();
  }
};