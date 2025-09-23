import React from "react";
import { RecentActivity } from "../../../components/Cards/RecentActivity";

export const ActivityLogs: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Activity Logs
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track all recent actions and changes happening in the system.
        </p>
      </div>

      {/* Activity Feed */}
      <div>
        <RecentActivity />
      </div>
    </div>
  );
};
