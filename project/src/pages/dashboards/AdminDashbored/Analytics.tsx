import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "../../../components/ui/Card";
import { useFirestoreQuery } from "../../../hooks/useFirestoreQuery";
import { Course, Progress, TrainingSession, User } from "../../../types";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar,
} from "recharts";
import { subDays, format } from "date-fns";

/** Tailwind color palette */
const TAILWIND_COLORS = {
  indigo: "#4F46E5",
  cyan: "#0891B2",
  lime: "#84CC16",
  amber: "#F59E0B",
  rose: "#EF4444",
  violet: "#7C3AED",
};

/** Light variants for dark mode */
const DARK_MODE_COLORS = {
  indigo: "#818CF8",
  cyan: "#22D3EE",
  lime: "#D9F99D",
  amber: "#FCD34D",
  rose: "#FCA5A5",
  violet: "#C4B5FD",
};

const COLOR_PALETTE = [
  TAILWIND_COLORS.indigo,
  TAILWIND_COLORS.cyan,
  TAILWIND_COLORS.lime,
  TAILWIND_COLORS.amber,
  TAILWIND_COLORS.rose,
  TAILWIND_COLORS.violet,
];

const DARK_PALETTE = [
  DARK_MODE_COLORS.indigo,
  DARK_MODE_COLORS.cyan,
  DARK_MODE_COLORS.lime,
  DARK_MODE_COLORS.amber,
  DARK_MODE_COLORS.rose,
  DARK_MODE_COLORS.violet,
];

export const Analytics: React.FC = () => {
  const { data: users = [], loading: usersLoading } = useFirestoreQuery<User>("users");
  const { data: courses = [], loading: coursesLoading } = useFirestoreQuery<Course>("courses");
  const { data: progress = [], loading: progressLoading } = useFirestoreQuery<Progress>("progress");
  const { data: sessions = [], loading: sessionsLoading } = useFirestoreQuery<TrainingSession>("sessions");

  const loading = usersLoading || coursesLoading || progressLoading || sessionsLoading;
  const [daysRange, setDaysRange] = useState<number>(14);

  /** Detect dark mode */
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  /** Summary metrics */
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

  /** Users per day (last N days) */
  const usersLastNDays = useMemo(() => {
    const N = daysRange;
    const bins: Record<string, number> = {};
    for (let i = N - 1; i >= 0; i--) {
      const d = subDays(new Date(), i);
      bins[format(d, "yyyy-MM-dd")] = 0;
    }

    (users || []).forEach(u => {
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

  /** Courses by status (pie chart) */
  const coursesByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    (courses || []).forEach((c: any) => {
      const s = c?.status || "unknown";
      map[s] = (map[s] || 0) + 1;
    });
    return Object.keys(map).map((name, idx) => ({
      name,
      value: map[name],
      color: isDarkMode ? DARK_PALETTE[idx % DARK_PALETTE.length] : COLOR_PALETTE[idx % COLOR_PALETTE.length]
    }));
  }, [courses, isDarkMode]);

  /** Top courses by participants (bar chart) */
  const topCourses = useMemo(() => {
    if (!Array.isArray(courses)) return [];
    const withParts = courses.map(c => ({
      id: c.id,
      title: c.title,
      participants: typeof (c as any).currentParticipants === "number" ? (c as any).currentParticipants : 0,
    }));
    const hasParticipants = withParts.some(w => w.participants > 0);
    if (hasParticipants) return withParts.sort((a, b) => b.participants - a.participants).slice(0, 6).map(i => ({ title: i.title, participants: i.participants }));

    if (Array.isArray(progress) && progress.length > 0) {
      const counts: Record<string, number> = {};
      progress.forEach((p: any) => { if (!p?.courseId) return; counts[p.courseId] = (counts[p.courseId] || 0) + 1; });
      return Object.entries(counts).map(([courseId, cnt]) => {
        const found = (courses || []).find(c => c.id === courseId);
        return { title: found?.title || courseId, participants: cnt };
      }).sort((a, b) => b.participants - a.participants).slice(0, 6);
    }
    return [];
  }, [courses, progress]);

  const chartLineColor = isDarkMode ? DARK_MODE_COLORS.indigo : TAILWIND_COLORS.indigo;
  const chartBarColor = isDarkMode ? DARK_MODE_COLORS.cyan : TAILWIND_COLORS.cyan;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Analytics & Reports</h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          ["Total Users", totals.totalUsers],
          ["Active Courses", totals.activeCourses],
          ["Avg Completion", Number.isFinite(totals.completionRate) ? `${totals.completionRate}%` : "—"],
          ["Monthly Sessions", totals.monthlySessions]
        ].map(([label, value], idx) => (
          <Card key={idx}>
            <CardContent>
              <div className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>{label}</div>
              <div className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Date range buttons */}
      <div className="flex items-center gap-3">
        <div className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>Date range:</div>
        <div className="flex gap-2">
          {[7, 14, 30].map(days => (
            <button key={days} onClick={() => setDaysRange(days)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${daysRange === days ? "bg-indigo-600 text-white" : isDarkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-700"}`}>
              {days}d
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line chart */}
        <Card className="lg:col-span-2">
          <CardContent>
            <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>New Users (last {daysRange} days)</h3>
            <div style={{ height: 230 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={usersLastNDays}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#555" : "#e0e0e0"} />
                  <XAxis dataKey="date" stroke={isDarkMode ? "#fff" : "#333"} />
                  <YAxis stroke={isDarkMode ? "#fff" : "#333"} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: isDarkMode ? "#333" : "#fff", color: isDarkMode ? "#fff" : "#000" }} />
                  <Line type="monotone" dataKey="newUsers" stroke={chartLineColor} strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie chart */}
        <Card>
          <CardContent>
            <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Courses by Status</h3>
            <div style={{ height: 230 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={coursesByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                    {coursesByStatus.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: isDarkMode ? "#333" : "#fff", color: isDarkMode ? "#fff" : "#000" }} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: isDarkMode ? "#fff" : "#000" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bar chart */}
      <Card>
        <CardContent>
          <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Top Courses by Participants</h3>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCourses}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#555" : "#e0e0e0"} />
                <XAxis dataKey="title" stroke={isDarkMode ? "#fff" : "#333"} tick={{ fontSize: 12 }} interval={0} />
                <YAxis stroke={isDarkMode ? "#fff" : "#333"} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: isDarkMode ? "#333" : "#fff", color: isDarkMode ? "#fff" : "#000" }} />
                <Bar dataKey="participants" fill={chartBarColor} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default Analytics;
