import React from "react";
import { DashboardOverview } from "./DashboardOverview";
import { CourseManagement } from  './CourseManagement';
import { UserManagement } from "./UserManagement";
import { Analytics } from "./Analytics";
import { ActivityLogs } from "./ActivityLogs";

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
