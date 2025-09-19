import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Plus, Calendar } from "lucide-react";
import { db } from "../../../lib/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { useAuth } from "../../../contexts/AuthContext";
import { TrainingSession } from "../../../types";

export const TrainingSessions: React.FC = () => {
  const { currentUser } = useAuth();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form fields
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  // Fetch sessions for current trainer
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "trainingSessions"),
      where("trainerId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: (doc.data().date as Timestamp).toDate(),
      })) as TrainingSession[];
      setSessions(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const formatDateWithDay = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleSchedule = async () => {
    if (!title || !date || !startTime || !endTime) return;

    const sessionDate = new Date(`${date}T${startTime}`);
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    await addDoc(collection(db, "trainingSessions"), {
      courseId,
      title,
      date: sessionDate,
      hours: durationHours,
      location,
      attendees: [],
      materials: [],
      notes,
      trainerId: currentUser?.uid,
      createdAt: new Date(),
    });

    // reset
    setCourseId("");
    setTitle("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setLocation("");
    setNotes("");
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Training Sessions
        </h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" /> Schedule Session
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="space-y-4 p-4">
            <input
              type="text"
              placeholder="Course ID"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="border p-2 rounded w-full"
            />
            <input
              type="text"
              placeholder="Session Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border p-2 rounded w-full"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border p-2 rounded w-full"
            />
            <div className="flex gap-2">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="border p-2 rounded w-full"
              />
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border p-2 rounded w-full"
            />
            <textarea
              placeholder="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border p-2 rounded w-full"
            />
            <Button onClick={handleSchedule}>Save Session</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          {loading ? (
            <p>Loading sessions...</p>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No sessions scheduled yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((s) => (
                <Card key={s.id}>
                  <CardHeader>{s.title}</CardHeader>
                  <CardContent>
                    <p>Date: {formatDateWithDay(s.date)}</p>
                    <p>Duration: {s.hours} hour(s)</p>
                    <p>Location: {s.location || "TBD"}</p>
                    <p>Enrolled: {s.attendees?.length || 0}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
