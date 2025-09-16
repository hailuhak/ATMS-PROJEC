import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Award,
  Play,
  Download,
  Clock
} from 'lucide-react';
import { StatsCard } from '../../components/Cards/StatsCard';
import { RecentActivity } from '../../components/Cards/RecentActivity';
import { CourseCard } from '../../components/courses/CourseCard';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';

interface TraineeDashboardProps {
  activeSection: string;
}

export const TraineeDashboard: React.FC<TraineeDashboardProps> = ({ activeSection }) => {
  const { currentUser } = useAuth();

  const sampleCourses = [
    {
      id: '1',
      title: 'Financial Audit Fundamentals',
      description: 'Learn the basics of financial auditing processes and procedures.',
      instructorId: 'instructor1',
      instructorName: 'Dr. Sarah Johnson',
      duration: 40,
      level: 'beginner' as const,
      category: 'Financial Audit',
      maxParticipants: 30,
      currentParticipants: 25,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-03-15'),
      materials: [],
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      title: 'Risk Assessment & Management',
      description: 'Advanced techniques for identifying and managing audit risks.',
      instructorId: 'instructor2',
      instructorName: 'Prof. Michael Chen',
      duration: 35,
      level: 'intermediate' as const,
      category: 'Risk Management',
      maxParticipants: 25,
      currentParticipants: 18,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-04-01'),
      materials: [],
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const renderDashboardOverview = () => (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {currentUser?.displayName?.split(' ')[0] || 'Student'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Continue your audit training journey
          </p>
        </div>
        <Button>
          <BookOpen className="w-4 h-4 mr-2" />
          Browse Courses
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Enrolled Courses"
          value="3"
          change="1 new this month"
          changeType="increase"
          icon={BookOpen}
          color="blue"
        />
        <StatsCard
          title="Completed Courses"
          value="7"
          change="2 completed this month"
          changeType="increase"
          icon={Award}
          color="green"
        />
        <StatsCard
          title="Study Hours"
          value="45.2"
          change="8.5 hrs this week"
          changeType="increase"
          icon={Clock}
          color="purple"
        />
        <StatsCard
          title="Average Score"
          value="92%"
          change="3% improvement"
          changeType="increase"
          icon={TrendingUp}
          color="yellow"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  My Current Courses
                </h3>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sampleCourses.map((course) => (
                  <div key={course.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {course.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          by {course.instructorName}
                        </p>
                      </div>
                      <Button size="sm">
                        <Play className="w-4 h-4 mr-2" />
                        Continue
                      </Button>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">67%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                      <span>Next: Module 4 - Advanced Techniques</span>
                      <span>{course.duration} hours total</span>
                    </div>
                  </div>
                ))}
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
            Track your enrolled courses and progress
          </p>
        </div>
        <Button>
          <BookOpen className="w-4 h-4 mr-2" />
          Browse More Courses
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onView={() => console.log('View course:', course.id)}
            showActions={true}
          />
        ))}
      </div>
    </div>
  );

  const renderProgress = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          My Progress
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track your learning achievements and milestones
        </p>
      </div>

      <Card>
        <CardContent>
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Detailed progress tracking coming soon...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          My Schedule
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View upcoming sessions and deadlines
        </p>
      </div>

      <Card>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Schedule view coming soon...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderResources = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Learning Resources
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Access course materials and downloads
        </p>
      </div>

      <Card>
        <CardContent>
          <div className="text-center py-12">
            <Download className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Resource library coming soon...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  switch (activeSection) {
    case 'courses':
      return renderMyCourses();
    case 'progress':
      return renderProgress();
    case 'schedule':
      return renderSchedule();
    case 'resources':
      return renderResources();
    default:
      return renderDashboardOverview();
  }
};