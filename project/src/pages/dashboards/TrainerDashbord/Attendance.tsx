import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../../components/ui/Card";
import { CheckSquare } from "lucide-react";
import { db } from "../../../lib/firebase";
import { collection, query, where, onSnapshot, updateDoc, doc, getDocs } from "firebase/firestore";
import { useAuth } from "../../../contexts/AuthContext";
import { AttendanceRecord, TrainingSession, Course } from "../../../types";

interface AttendanceProps {
  sessionId: string;
}

export const Attendance: React.FC<AttendanceProps> = ({ sessionId }) => {
  const { currentUser } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [trainees, setTrainees] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionDate, setSessionDate] = useState<Date | null>(null);

  // Fetch session info & trainees
  useEffect(() => {
    if (!sessionId || !currentUser) return;

    const fetchSessionAndTrainees = async () => {
      try {
        // Get session info
        const sessionRef = doc(db, "trainingSessions", sessionId);
        const sessionSnap = await getDocs(query(collection(db, "trainingSessions"), where("id", "==", sessionId)));
        let sessionData: TrainingSession | undefined;
        sessionSnap.forEach((doc) => {
          sessionData = { id: doc.id, ...(doc.data() as TrainingSession) };
        });
        setSessionDate(sessionData?.date || null);

        // Get trainees from enrolled list
        if (sessionData?.courseId) {
          const courseRef = doc(db, "courses", sessionData.courseId);
          const enrolledSnap = await getDocs(query(collection(db, "users"), where("enrolledCourses", "array-contains", sessionData?.courseId)));
          const enrolledTrainees = enrolledSnap.docs.map((d) => ({ id: d.id, name: d.data().name || "Unknown" }));
          setTrainees(enrolledTrainees);

          // Initialize attendance records if not exists
          enrolledTrainees.forEach(async (trainee) => {
            const attendanceQuery = query(
              collection(db, "attendance"),
              where("sessionId", "==", sessionId),
              where("studentId", "==", trainee.id)
            );
            const attSnap = await getDocs(attendanceQuery);
            if (attSnap.empty) {
              await updateDoc(doc(collection(db, "attendance")), {
                sessionId,
                studentId: trainee.id,
                studentName: trainee.name,
                status: "absent",
                timestamp: new Date(),
              });
            }
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionAndTrainees();
  }, [sessionId, currentUser]);

  // Listen to attendance updates
  useEffect(() => {
    if (!sessionId) return;
    const q = query(collection(db, "attendance"), where("sessionId", "==", sessionId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as AttendanceRecord[];
      setRecords(data);
    });
    return () => unsubscribe();
  }, [sessionId]);

  const toggleAttendance = async (record: AttendanceRecord) => {
    if (!record.id) return;
    const recordRef = doc(db, "attendance", record.id);
    await updateDoc(recordRef, {
      status: record.status === "present" ? "absent" : "present",
      timestamp: new Date(),
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        Attendance Management
      </h1>
      {sessionDate && (
        <p className="text-gray-700 dark:text-gray-300 mb-2">
          Session Date: {sessionDate.toDateString()}
        </p>
      )}
      <Card>
        <CardContent>
          {loading ? (
            <p className="text-gray-700 dark:text-gray-300">Loading attendance...</p>
          ) : trainees.length === 0 ? (
            <div className="text-center py-12">
              <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No trainees enrolled in this course.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {trainees.map((trainee) => {
                const record = records.find((r) => r.studentId === trainee.id);
                return (
                  <div key={trainee.id} className="flex justify-between items-center border p-2 rounded">
                    <span>{trainee.name}</span>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={record?.status === "present"}
                        onChange={() => record && toggleAttendance(record)}
                        className="accent-green-500"
                      />
                      <span className="text-gray-800 dark:text-gray-200">
                        {record?.status === "present" ? "Present" : "Absent"}
                      </span>
                    </label>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
