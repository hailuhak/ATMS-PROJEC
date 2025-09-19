import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { CheckSquare } from 'lucide-react';
import { db } from '../../../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../../contexts/AuthContext';
import { AttendanceRecord } from '../../../types/index';

export const Attendance: React.FC<{ sessionId: string }> = ({ sessionId }) => {
  const { currentUser } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    const q = query(collection(db, 'attendance'), where('sessionId', '==', sessionId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as AttendanceRecord[];
      setRecords(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [sessionId]);

  const toggleAttendance = async (record: AttendanceRecord) => {
    if (!record.id) return;
    const recordRef = doc(db, 'attendance', record.id);
    await updateDoc(recordRef, {
      status: record.status === 'present' ? 'absent' : 'present',
      timestamp: new Date(),
    });
  };

  const markStudent = async (studentId: string, studentName: string) => {
    await addDoc(collection(db, 'attendance'), {
      sessionId,
      studentId,
      studentName,
      status: 'present',
      timestamp: new Date(),
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Attendance Management</h1>
      <Card>
        <CardContent>
          {loading ? (
            <p>Loading attendance...</p>
          ) : records.length === 0 ? (
            <div className="text-center py-12">
              <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No attendance recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {records.map((r) => (
                <div
                  key={r.id}
                  className="flex justify-between items-center border p-2 rounded"
                >
                  <span>{r.studentName}</span>
                  <button
                    className={`px-2 py-1 rounded text-white ${r.status === 'present' ? 'bg-green-500' : 'bg-red-500'}`}
                    onClick={() => toggleAttendance(r)}
                  >
                    {r.status.toUpperCase()}
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
