import React, { useEffect, useState } from "react";
import { StatsCard } from "../../../components/dashboard/StatsCard";
import { CourseCard } from "../../../components/courses/CourseCard";
import { RecentActivity } from "../../../components/dashboard/RecentActivity";
import { Card, CardContent, CardHeader } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Plus, Users, BookOpen, TrendingUp, Activity } from "lucide-react";
import { db } from "../../../lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Course, User } from "../../../types";

export const DashboardOverview: React.FC = () => {
  const [usersCount, setUsersCount] = useState(0);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  // Real-time Firestore listeners
  useEffect(() => {
    // Listen to users
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsersCount(snapshot.size);
    });

    // Listen to courses
    const coursesQuery = query(collection(db, "courses"), orderBy("createdAt", "desc"));
    const unsubscribeCourses = onSnapshot(coursesQuery, (snapshot) => {
      const formattedCourses = snapshot.docs.map((doc) => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          instructorId: data.instructorId,
          instructorName: data.instructorName,
          duration: data.duration || 0,
          level: data.level || "beginner",
          category: data.category || "",
          maxParticipants: data.maxParticipants || 0,
          currentParticipants: data.currentParticipants || 0,
          startDate: data.startDate?.toDate ? data.startDate.toDate() : new Date(),
          endDate: data.endDate?.toDate ? data.endDate.toDate() : new Date(),
          materials: data.materials || [],
          status: data.status || "active",
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
        } as Course;
      });
      setCourses(formattedCourses);
      setCoursesLoading(false);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeCourses();
    };
  }, []);

  // Derived stats
  const completionRate = courses.length
    ? Math.round((courses.filter(c => c.status === "completed").length / courses.length) * 100)
    : 0;

  const monthlySessions = courses.filter(
    c => c.startDate.getMonth() === new Date().getMonth()
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
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
          <Plus className="w-4 h-4 mr-2" /> Quick Action
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={usersCount.toString()}
          change="12.3%"
          changeType="increase"
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Active Courses"
          value={courses.length.toString()}
          change="8.1%"
          changeType="increase"
          icon={BookOpen}
          color="green"
        />
        <StatsCard
          title="Completion Rate"
          value={`${completionRate}%`}
          change="2.4%"
          changeType="increase"
          icon={TrendingUp}
          color="yellow"
        />
        <StatsCard
          title="Monthly Sessions"
          value={monthlySessions.toString()}
          change="15.8%"
          changeType="increase"
          icon={Activity}
          color="purple"
        />
      </div>

      {/* Recent Courses & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                {coursesLoading
                  ? [...Array(4)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48"></div>
                      </div>
                    ))
                  : courses.slice(0, 4).map((course) => (
                      <CourseCard key={course.id} course={course} showActions={false} />
                    ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <RecentActivity /> {/* Can also be hooked to Firestore real-time */}
        </div>
      </div>
    </div>
  );
};
