import React from "react";
import { DashboardOverview } from "./DashboardOverview";
import { CourseManagement } from  './CourseManagement';
import { UserManagement } from "./UserManagement";
import  Session from "./Session";
import { ActivityLogs } from "./ActivityLogs";
import GradeReport from "./GradeReport";

interface AdminDashboardProps {
  activeSection: "users" | "courses" | "sessions" | "activities" | "grades";
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeSection }) => {
  switch (activeSection) {
    case "users":
      return <UserManagement />;
    case "courses":
      return <CourseManagement />;
    case "sessions":
      return <Session/>;
    case "activities":
      return <ActivityLogs />;
    case "grades":
      return <GradeReport />;
    default:
      return <DashboardOverview />;
  }
};
