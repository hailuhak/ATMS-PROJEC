import React from 'react';
import { Filter } from 'lucide-react';
import { CourseCard } from '../../../components/courses/CourseCard';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card, CardContent } from '../../../components/ui/Card';
import { User } from '../../../types';

interface BrowseCoursesProps {
  currentUser: User | null;
}

const sampleCourses = [
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
];

export const BrowseCourses: React.FC<BrowseCoursesProps> = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Browse Courses</h1>
      <p className="text-gray-600 dark:text-gray-400">Find the right course for you</p>

      {/* Search & Filters */}
      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input placeholder="Search courses, topics, instructors..." />
            <select className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white">
              <option>All Categories</option>
              <option>Technology</option>
              <option>Ethics</option>
            </select>
            <select className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white">
              <option>All Levels</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" /> More Filters
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
            onEnroll={() => console.log('Enroll:', course.title)}
            onView={() => console.log('View:', course.title)}
            showActions
          />
        ))}
      </div>
    </div>
  );
};
