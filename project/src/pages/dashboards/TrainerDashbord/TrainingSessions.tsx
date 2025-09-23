import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Plus, Calendar, X } from "lucide-react";
import { db } from "../../../lib/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
  getDocs,
} from "firebase/firestore";
import { useAuth } from "../../../contexts/AuthContext";
import { TrainingSession, Course } from "../../../types";

export const TrainingSessions: React.FC = () => {
  const { currentUser } = useAuth();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);

  // Form fields
  const [courseId, setCourseId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Fetch courses once
  useEffect(() => {
    const fetchCourses = async () => {
      const q = query(collection(db, "courses"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Course) }));
      setCourses(data);
    };
    fetchCourses();
  }, []);

  // Fetch sessions in real-time
  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, "trainingSessions"), where("trainerId", "==", currentUser.uid));
    const unsubscribe = onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<TrainingSession, "id">),
        date: (doc.data().date as Timestamp).toDate(),
      }));
      data.sort((a, b) => a.date.getTime() - b.date.getTime());
      setSessions(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });

  const handleSchedule = async () => {
    if (!courseId || !date || !startTime || !endTime) return;

    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    const course = courses.find(c => c.id === courseId);

    await addDoc(collection(db, "trainingSessions"), {
      courseId,
      courseName: course?.title || "",
      date: start,
      hours: durationHours,
      attendees: [],
      trainerId: currentUser?.uid,
      createdAt: new Date(),
    });

    // reset form & close modal
    setCourseId(""); setDate(""); setStartTime(""); setEndTime(""); setShowFormModal(false);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Training Sessions</h1>
        <Button onClick={() => setShowFormModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white">
          <Plus className="w-4 h-4" /> Add Session
        </Button>
      </div>

      {/* Sessions List */}
      <Card className="bg-white dark:bg-gray-800 shadow-md">
        <CardContent>
          {loading ? <p className="text-gray-700 dark:text-gray-300">Loading sessions...</p> : sessions.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No sessions scheduled yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map(s => (
                <Card key={s.id} className="bg-gray-50 dark:bg-gray-700 shadow-sm">
                  <CardHeader className="text-lg font-semibold dark:text-gray-100">{s.courseName}</CardHeader>
                  <CardContent className="text-gray-700 dark:text-gray-200">
                    <p>Date: {formatDate(s.date)}</p>
                    <p>Duration: {s.hours} hour(s)</p>
                    <p>Enrolled: {s.attendees?.length || 0}</p>
                    {s.attendees && s.attendees.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {s.attendees.map(a => (
                          <span key={a.id} className="bg-blue-100 dark:bg-blue-600 text-blue-800 dark:text-white px-2 py-1 rounded-full text-sm">{a.name}</span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Session Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 shadow-lg relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white" onClick={() => setShowFormModal(false)}>
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Add Training Session</h2>
            <select value={courseId} onChange={e => setCourseId(e.target.value)} className="border p-2 rounded w-full mb-3 text-gray-900 dark:text-gray-100 dark:bg-gray-700">
              <option value="">Select Course</option>
              {courses.map(c => (<option key={c.id} value={c.id}>{c.title}</option>))}
            </select>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border p-2 rounded w-full mb-3 text-gray-900 dark:text-gray-100 dark:bg-gray-700" />
            <div className="flex gap-2 mb-3">
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="border p-2 rounded w-full text-gray-900 dark:text-gray-100 dark:bg-gray-700" />
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="border p-2 rounded w-full text-gray-900 dark:text-gray-100 dark:bg-gray-700" />
            </div>
            <Button onClick={handleSchedule} className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white">Save Session</Button>
          </div>
        </div>
      )}
    </div>
  );
};
