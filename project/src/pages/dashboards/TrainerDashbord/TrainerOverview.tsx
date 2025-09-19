import React, { useState, useEffect } from 'react';
import { StatsCard } from '../../../components/Cards/StatsCard';
import { RecentActivity } from '../../../components/Cards/RecentActivity';
import { BookOpen, Calendar, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { useAuth } from '../../../contexts/AuthContext';
import { CourseCard } from '../../../components/courses/CourseCard';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

// Define the full Course type expected by CourseCard
interface Course {
  id: string;
  title: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  status: 'active' | 'draft' | 'completed' | 'cancelled';
  students: string[];
  completionRate?: number;
  instructorId: string;
  instructorName: string;
  hours: number;
  startDate?: any; // Firestore timestamp or Date
  endDate?: any;
}

export const TrainerOverview: React.FC = () => {
  const { currentUser } = useAuth();

  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    courses: 0,
    activeSessions: 0,
    totalStudents: 0,
    completionRate: 0,
  });

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'courses'),
      where('instructorId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const coursesData: Course[] = [];
      let active = 0;
      let students = 0;
      let completionSum = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        const course: Course = {
          id: doc.id,
          title: data.title || '',
          category: data.category || '',
          level: data.level || 'beginner',
          status: data.status || 'draft',
          students: Array.isArray(data.students) ? data.students : [],
          completionRate: data.completionRate || 0,
          instructorId: data.instructorId || '',
          instructorName: data.instructorName || '',
          hours: data.hours || 0,
          startDate: data.startDate || null,
          endDate: data.endDate || null,
        };
        coursesData.push(course);

        if (course.status === 'active') active++;
        students += course.students.length;
        completionSum += course.completionRate || 0;
      });

      setMyCourses(coursesData);
      setStats({
        courses: coursesData.length,
        activeSessions: active,
        totalStudents: students,
        completionRate: coursesData.length
          ? +(completionSum / coursesData.length).toFixed(1)
          : 0,
      });
      setCoursesLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return (
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
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="My Courses"
          value={stats.courses.toString()}
          icon={BookOpen}
          color="blue"
        />
        <StatsCard
          title="Active Sessions"
          value={stats.activeSessions.toString()}
          icon={Calendar}
          color="green"
        />
        <StatsCard
          title="Total Students"
          value={stats.totalStudents.toString()}
          icon={Users}
          color="yellow"
        />
        <StatsCard
          title="Completion Rate"
          value={`${stats.completionRate}%`}
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
                  Recent Courses
                </h3>
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
                  </div>
                ) : (
                  myCourses.slice(0, 4).map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
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
};
