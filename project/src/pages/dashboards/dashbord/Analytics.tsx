import React, { useMemo, useState } from "react";
import { Card, CardContent } from "../../../components/ui/Card";
import { useFirestoreQuery } from "../../../hooks/useFirestoreQuery";
import { Course, Progress, TrainingSession, User } from "../../../types";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar,
} from "recharts";
import { subDays, format } from "date-fns";
import { TrendingUp } from "lucide-react";

/**
 * Analytics (real-time)
 * - uses useFirestoreQuery("users","courses","progress","sessions")
 * - date range control (7/14/30 days)
 * - charts styled with Tailwind-like colors
 *
 * NOTE: This is defensive — if a collection or field doesn't exist it will degrade gracefully.
 */

const TAILWIND_COLORS = {
  indigo: "#4F46E5",
  cyan: "#0891B2",
  lime: "#84CC16",
  amber: "#F59E0B",
  rose: "#EF4444",
  violet: "#7C3AED",
};

const COLOR_PALETTE = [
  TAILWIND_COLORS.indigo,
  TAILWIND_COLORS.cyan,
  TAILWIND_COLORS.lime,
  TAILWIND_COLORS.amber,
  TAILWIND_COLORS.rose,
  TAILWIND_COLORS.violet,
];

export const Analytics: React.FC = () => {
  // realtime queries using your hook (returns { data, loading })
  const { data: users = [], loading: usersLoading } = useFirestoreQuery<User>("users");
  const { data: courses = [], loading: coursesLoading } = useFirestoreQuery<Course>("courses");
  const { data: progress = [], loading: progressLoading } = useFirestoreQuery<Progress>("progress");
  const { data: sessions = [], loading: sessionsLoading } = useFirestoreQuery<TrainingSession>("sessions");

  // date range control (N days)
  const [daysRange, setDaysRange] = useState<number>(14); // 7 | 14 | 30

  const loading = usersLoading || coursesLoading || progressLoading || sessionsLoading;

  // ---- Derived summary metrics ----
  const totals = useMemo(() => {
    const totalUsers = Array.isArray(users) ? users.length : 0;
    const activeCourses = Array.isArray(courses) ? courses.filter(c => c.status === "active").length : 0;

    let completionRate = NaN;
    if (Array.isArray(progress) && progress.length > 0) {
      const sum = progress.reduce((s, p) => s + (typeof (p as any).progress === "number" ? (p as any).progress : 0), 0);
      completionRate = Math.round((sum / progress.length) * 10) / 10;
    }

    const now = new Date();
    const monthlySessions = Array.isArray(sessions)
      ? sessions.filter(s => {
          const d = (s as any).date instanceof Date ? (s as any).date
            : (s as any).date?.toDate ? (s as any).date.toDate()
            : null;
          return d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length
      : 0;

    return { totalUsers, activeCourses, completionRate, monthlySessions };
  }, [users, courses, progress, sessions]);

  // ---- Users per day (last N days) ----
  const usersLastNDays = useMemo(() => {
    const N = daysRange;
    const bins: Record<string, number> = {};
    for (let i = N - 1; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const key = format(d, "yyyy-MM-dd");
      bins[key] = 0;
    }

    (users || []).forEach(u => {
      if (!u) return;
      let d: Date | null = null;
      if (u.createdAt instanceof Date) d = u.createdAt;
      else if ((u as any).createdAt?.toDate) d = (u as any).createdAt.toDate();
      else if (typeof (u as any).createdAt === "string" || typeof (u as any).createdAt === "number") d = new Date((u as any).createdAt);

      if (!d) return;
      const key = format(d, "yyyy-MM-dd");
      if (key in bins) bins[key] = (bins[key] || 0) + 1;
    });

    return Object.keys(bins).map(k => ({ date: format(new Date(k), "MMM d"), newUsers: bins[k] }));
  }, [users, daysRange]);

  // ---- Courses by status (pie) ----
  const coursesByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    (courses || []).forEach((c: any) => {
      const s = c?.status || "unknown";
      map[s] = (map[s] || 0) + 1;
    });
    return Object.keys(map).map((name, idx) => ({ name, value: map[name], color: COLOR_PALETTE[idx % COLOR_PALETTE.length] }));
  }, [courses]);

  // ---- Top courses by participants (bar) ----
  // Prefer currentParticipants if exists, else fall back to progress counts
  const topCourses = useMemo(() => {
    if (!Array.isArray(courses)) return [];

    const withParts = courses.map(c => ({
      id: c.id,
      title: c.title,
      participants: typeof (c as any).currentParticipants === "number" ? (c as any).currentParticipants : 0,
    }));

    const hasParticipants = withParts.some(w => w.participants > 0);
    if (hasParticipants) {
      return withParts.sort((a, b) => b.participants - a.participants).slice(0, 6).map(i => ({ title: i.title, participants: i.participants }));
    }

    if (Array.isArray(progress) && progress.length > 0) {
      const counts: Record<string, number> = {};
      progress.forEach((p: any) => {
        if (!p?.courseId) return;
        counts[p.courseId] = (counts[p.courseId] || 0) + 1;
      });
      const arr = Object.entries(counts).map(([courseId, cnt]) => {
        const found = (courses || []).find(c => c.id === courseId);
        return { title: found?.title || courseId, participants: cnt };
      });
      return arr.sort((a, b) => b.participants - a.participants).slice(0, 6);
    }

    return [];
  }, [courses, progress]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h1>
        <div className="text-sm text-gray-600 dark:text-gray-400">Realtime analytics (Firestore)</div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent>
            <div className="text-sm text-gray-500">Total Users</div>
            <div className="text-2xl font-bold">{totals.totalUsers}</div>
            <div className="text-xs text-gray-400 mt-1">{loading ? "Updating…" : "Realtime"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-sm text-gray-500">Active Courses</div>
            <div className="text-2xl font-bold">{totals.activeCourses}</div>
            <div className="text-xs text-gray-400 mt-1">Active</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-sm text-gray-500">Avg Completion</div>
            <div className="text-2xl font-bold">{Number.isFinite(totals.completionRate) ? `${totals.completionRate}%` : "—"}</div>
            <div className="text-xs text-gray-400 mt-1">From progress</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-sm text-gray-500">Monthly Sessions</div>
            <div className="text-2xl font-bold">{totals.monthlySessions}</div>
            <div className="text-xs text-gray-400 mt-1">This month</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls (date range) */}
      <div className="flex items-center gap-3">
        <div className="text-sm text-gray-600">Date range:</div>
        <div className="flex gap-2">
          {[7, 14, 30].map(days => (
            <button
              key={days}
              onClick={() => setDaysRange(days)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${daysRange === days ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"}`}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      {/* Charts: users (line), courses (pie), top courses (bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users line chart */}
        <Card className="lg:col-span-2">
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">New Users (last {daysRange} days)</h3>
              <div className="text-sm text-gray-500">{loading ? "Updating…" : "Realtime"}</div>
            </div>
            <div style={{ height: 230 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={usersLastNDays}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="newUsers" stroke={TAILWIND_COLORS.indigo} strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Courses by status pie */}
        <Card>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Courses by Status</h3>
              <div className="text-sm text-gray-500">Realtime</div>
            </div>
            <div style={{ height: 230 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={coursesByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                    {coursesByStatus.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color || COLOR_PALETTE[idx % COLOR_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top courses */}
      <Card>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Top Courses by Participants</h3>
            <div className="text-sm text-gray-500">Realtime</div>
          </div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCourses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="title" tick={{ fontSize: 12 }} interval={0} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="participants" fill={TAILWIND_COLORS.cyan} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Note about caching for large datasets */}
      <div className="text-xs text-gray-500">
        Tip: for large datasets you should aggregate counts server-side (Cloud Functions) and store summarised documents
        to avoid scanning many documents client-side. I can add that Cloud Function if you want.
      </div>
    </div>
  );
};

export default Analytics;
