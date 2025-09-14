import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Clock, BookOpen } from 'lucide-react';
import { Course } from '../../types';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';

interface CourseCardProps {
  course: Course;
  onEnroll?: () => void;
  onEdit?: () => void;
  onView?: () => void;
  showActions?: boolean;
}

const levelColors: Record<string, string> = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  advanced: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onEnroll,
  onEdit,
  onView,
  showActions = true,
}) => {
  const levelColor = levelColors[course.level] ?? levelColors.default;
  const statusColor = statusColors[course.status] ?? statusColors.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        {/* Header */}
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
              {course.title || 'Untitled Course'}
            </h3>

            <div className="flex gap-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${levelColor}`}
              >
                {course.level ? course.level.charAt(0).toUpperCase() + course.level.slice(1) : 'N/A'}
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}
              >
                {course.status ? course.status.charAt(0).toUpperCase() + course.status.slice(1) : 'N/A'}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            by {course.instructorName || 'Unknown Instructor'}
          </p>
        </CardHeader>

        {/* Content */}
        <CardContent>
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-3">
            {course.description || 'No description provided.'}
          </p>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              {course.duration ? `${course.duration} hours` : 'N/A'}
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              {course.currentParticipants ?? 0}/{course.maxParticipants ?? '∞'}
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {course.startDate
                ? course.startDate.toLocaleDateString()
                : 'No start date'}
            </div>
            <div className="flex items-center">
              <BookOpen className="w-4 h-4 mr-2" />
              {course.category || 'Uncategorized'}
            </div>
          </div>
        </CardContent>

        {/* Actions */}
        {showActions && (
          <CardFooter>
            <div className="flex gap-2 w-full">
              {onView && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onView}
                  className="flex-1"
                >
                  View Details
                </Button>
              )}
              {onEnroll && course.status === 'active' && (
                <Button size="sm" onClick={onEnroll} className="flex-1">
                  Enroll Now
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onEdit}
                  className="flex-1"
                >
                  Edit Course
                </Button>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};
