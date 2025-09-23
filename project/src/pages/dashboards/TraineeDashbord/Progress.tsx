import React, { useMemo } from "react";
import { Card, CardContent } from "../../../components/ui/Card";
import { TrendingUp, BookOpen, CheckCircle } from "lucide-react";
import { useCourses } from "../../../hooks/useCourses";
import { User } from "../../../types";

interface ProgressProps {
  currentUser: User;
}

export const Progress: React.FC<ProgressProps> = ({ currentUser }) => {
  const { enrollments } = useCourses(currentUser);

  const stats = useMemo(() => {
    const completedCourses = enrollments.filter(e => e.status === "completed").length;
    const activeCourses = enrollments.filter(e => e.status === "active").length;

    // Only sum hours for completed courses
    const hoursLearned = enrollments
      .filter(e => e.status === "completed")
      .reduce((sum, e) => sum + (e.hours || 0), 0);

    // Total hours from all enrolled courses (for progress bar)
    const totalHours = enrollments.reduce((sum, e) => sum + (e.hours || 0), 0);

    const totalCourses = enrollments.length;

    return [
      {
        label: "Courses Completed",
        value: completedCourses,
        total: totalCourses || 1,
        icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      },
      {
        label: "Hours Learned",
        value: hoursLearned,
        total: totalHours || 1,
        icon: <TrendingUp className="w-6 h-6 text-blue-500" />,
      },
      {
        label: "Active Courses",
        value: activeCourses,
        total: totalCourses || 1,
        icon: <BookOpen className="w-6 h-6 text-yellow-500" />,
      },
    ];
  }, [enrollments]);

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          My Progress
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track your learning achievements and milestones
        </p>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(stat => {
          const progressPercent = Math.min(
            100,
            Math.round((stat.value / stat.total) * 100)
          );

          return (
            <Card
              key={stat.label}
              className="bg-gray-50 dark:bg-gray-800 shadow-md rounded-lg"
            >
              <CardContent>
                <div className="flex items-center mb-3">
                  {stat.icon}
                  <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                    {stat.label}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-blue-500 dark:bg-blue-400 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {stat.value} / {stat.total} ({progressPercent}%)
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
