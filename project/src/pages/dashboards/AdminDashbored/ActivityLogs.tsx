import React from "react";
import { RecentActivity } from "../../../components/Cards/RecentActivity";

export const ActivityLogs: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Activity Logs
      </h1>
      <RecentActivity />
    </div>
  );
};
