import React, { useEffect, useState } from "react";
import { RecentActivity } from "../../../components/Cards/RecentActivity";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { ActivityLog } from "../../../types"; // your interface

export const ActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const q = query(collection(db, "activityLogs"), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);

        const data: ActivityLog[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.() || new Date(),
        })) as ActivityLog[];

        setLogs(data);
      } catch (error) {
        console.error("Error fetching activity logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

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
        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Loading activity...</p>
        ) : logs.length > 0 ? (
          <RecentActivity logs={logs} />
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No activity found.</p>
        )}
      </div>
    </div>
  );
};
