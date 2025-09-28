import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, Award } from 'lucide-react';
import { StatsCard } from '../../../components/Cards/StatsCard';
import { CourseCard } from '../../../components/courses/CourseCard';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { User } from '../../../types';

interface DashboardOverviewProps {
  currentUser: User | null;
}

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
];

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ currentUser }) => {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl p-8 text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">
          Welcome, {currentUser?.displayName?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-blue-100 text-lg">
          Discover audit training courses to advance your career
        </p>
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
        <CardHeader className="flex justify-between items-center">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Featured Courses
          </h3>
          <Button variant="outline">View All Courses</Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEnroll={() => console.log('Enroll in:', course.title)}
                onView={() => console.log('View details:', course.title)}
                showActions
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
