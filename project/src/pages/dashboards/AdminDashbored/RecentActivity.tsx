// components/dashboard/RecentActivity.tsx
import React, { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from '../../../lib/firebase'; // adjust path if needed

interface ActivityLog {
  id: string;
  action: string;
  user: string;
  timestamp: any;
}

export const RecentActivity: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "activityLogs"),
      orderBy("timestamp", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activityData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<ActivityLog, "id">),
      }));
      setLogs(activityData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Recent Activity
      </h2>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {logs.length === 0 ? (
          <li className="py-2 text-gray-500 dark:text-gray-400">
            No activity yet.
          </li>
        ) : (
          logs.map((log) => (
            <li key={log.id} className="py-2">
              <p className="text-gray-800 dark:text-gray-200">
                <span className="font-medium">{log.user}</span> {log.action}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {log.timestamp?.toDate
                  ? log.timestamp.toDate().toLocaleString()
                  : "No date"}
              </p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};
