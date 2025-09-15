import React from "react";
import { DashboardOverview } from "./dashbord/DashboardOverview";
import { CourseManagement } from  './dashbord/CourseManagement';
import { UserManagement } from "./dashbord/UserManagement";
import { Analytics } from "./dashbord/Analytics";
import { ActivityLogs } from "./dashbord/ActivityLogs";

interface AdminDashboardProps {
  activeSection: "users" | "courses" | "analytics" | "activities";
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeSection }) => {
  switch (activeSection) {
    case "users":
      return <UserManagement />;
    case "courses":
      return <CourseManagement />;
    case "analytics":
      return <Analytics />;
    case "activities":
      return <ActivityLogs />;
    default:
      return <DashboardOverview />;
  }
};
