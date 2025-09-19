import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Course } from "../../../types";
import { useFirestoreQuery } from "../../../hooks/useFirestoreQuery";
import { db } from "../../../lib/firebase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  orderBy,
  limit,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export const CourseManagement: React.FC = () => {
  const { data: coursesFromDB, loading: coursesLoading } = useFirestoreQuery<Course>(
    "courses",
    [orderBy("createdAt", "desc"), limit(20)]
  );

  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<
    Omit<Course, "id" | "createdAt" | "updatedAt"> & { id?: string } | null
  >(null);

  const defaultCourse = {
    title: "",
    instructorName: "",
    category: "",
    duration: 0,
    level: "beginner" as const,
    startDate: new Date(),
    endDate: new Date(),
    materials: [] as string[],
    status: "active" as const,
    instructorId: "",
  };

  const [newCourse, setNewCourse] = useState(defaultCourse);

  useEffect(() => {
    if (coursesFromDB) {
      const formatted = coursesFromDB.map((course) => ({
        ...course,
        createdAt: course.createdAt instanceof Date ? course.createdAt : course.createdAt?.toDate(),
        updatedAt: course.updatedAt instanceof Date ? course.updatedAt : course.updatedAt?.toDate(),
      }));
      setCourses(formatted);
    }
  }, [coursesFromDB]);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || course.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Add course with instructorId check
  const handleAddCourse = async () => {
    if (!newCourse.title || !newCourse.instructorName) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      // Find trainer with matching name and role
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("displayName", "==", newCourse.instructorName),
        where("role", "==", "trainer")
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert("This trainer is not found or is not a trainer.");
        return;
      }

      const instructorUid = querySnapshot.docs[0].id;

      const courseRef = await addDoc(collection(db, "courses"), {
        ...newCourse,
        instructorId: instructorUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setCourses((prev) => [
        { ...newCourse, id: courseRef.id, instructorId: instructorUid, createdAt: new Date(), updatedAt: new Date() },
        ...prev,
      ]);

      setNewCourse(defaultCourse);
      setShowForm(false);
      alert("Course added successfully!");
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    }
  };

  // Save edit with same instructorId logic
  const handleSaveEdit = async () => {
    if (!editingCourse || !editingCourse.instructorName) return;

    try {
      // Check trainer again
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("displayName", "==", editingCourse.instructorName),
        where("role", "==", "trainer")
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert("This trainer is not found or is not a trainer.");
        return;
      }

      const instructorUid = querySnapshot.docs[0].id;

      await updateDoc(doc(db, "courses", editingCourse.id!), {
        ...editingCourse,
        instructorId: instructorUid,
        updatedAt: serverTimestamp(),
      });

      setCourses((prev) =>
        prev.map((c) =>
          c.id === editingCourse.id
            ? { ...c, ...editingCourse, updatedAt: new Date(), instructorId: instructorUid }
            : c
        )
      );

      setEditingCourse(null);
      setShowForm(false);
      alert("Course updated successfully!");
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await deleteDoc(doc(db, "courses", id));
      setCourses((prev) => prev.filter((c) => c.id !== id));
      alert("Course deleted successfully!");
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Course Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all courses</p>
        </div>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingCourse(null);
            setNewCourse(defaultCourse);
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Create Course
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-96"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit Form */}
      {showForm && (
        <Card>
          <CardContent>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              {editingCourse ? "Edit Course" : "Add New Course"}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Course Title */}
              <Input
                placeholder="Course Title"
                value={editingCourse ? editingCourse.title : newCourse.title}
                onChange={(e) =>
                  editingCourse
                    ? setEditingCourse({ ...editingCourse, title: e.target.value })
                    : setNewCourse({ ...newCourse, title: e.target.value })
                }
              />

              {/* Instructor Name */}
              <Input
                placeholder="Instructor Name"
                value={editingCourse ? editingCourse.instructorName : newCourse.instructorName}
                onChange={(e) =>
                  editingCourse
                    ? setEditingCourse({ ...editingCourse, instructorName: e.target.value })
                    : setNewCourse({ ...newCourse, instructorName: e.target.value })
                }
              />

              {/* Category */}
              <Input
                placeholder="Category"
                value={editingCourse ? editingCourse.category : newCourse.category}
                onChange={(e) =>
                  editingCourse
                    ? setEditingCourse({ ...editingCourse, category: e.target.value })
                    : setNewCourse({ ...newCourse, category: e.target.value })
                }
              />

              {/* Duration */}
              <Input
                type="number"
                placeholder="Duration (hours)"
                value={editingCourse ? editingCourse.duration || "" : newCourse.duration || ""}
                onChange={(e) =>
                  editingCourse
                    ? setEditingCourse({ ...editingCourse, duration: Number(e.target.value) })
                    : setNewCourse({ ...newCourse, duration: Number(e.target.value) })
                }
              />

              {/* Level */}
              <select
                value={editingCourse ? editingCourse.level : newCourse.level}
                onChange={(e) =>
                  editingCourse
                    ? setEditingCourse({ ...editingCourse, level: e.target.value as any })
                    : setNewCourse({ ...newCourse, level: e.target.value as any })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>

              {/* Start Date */}
              <div className="flex flex-col">
                <label className="text-gray-500 mb-1">Start Date</label>
                <DatePicker
                  selected={editingCourse ? editingCourse.startDate : newCourse.startDate}
                  onChange={(date: Date | null) => {
                    if (!date) return;
                    editingCourse
                      ? setEditingCourse({ ...editingCourse, startDate: date })
                      : setNewCourse({ ...newCourse, startDate: date });
                  }}
                  placeholderText="Select Start Date"
                  className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white"
                  dateFormat="yyyy-MM-dd"
                />
              </div>

              {/* End Date */}
              <div className="flex flex-col">
                <label className="text-gray-500 mb-1">End Date</label>
                <DatePicker
                  selected={editingCourse ? editingCourse.endDate : newCourse.endDate}
                  onChange={(date: Date | null) => {
                    if (!date) return;
                    editingCourse
                      ? setEditingCourse({ ...editingCourse, endDate: date })
                      : setNewCourse({ ...newCourse, endDate: date });
                  }}
                  placeholderText="Select End Date"
                  className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white"
                  dateFormat="yyyy-MM-dd"
                />
              </div>

              {/* Status */}
              <select
                value={editingCourse ? editingCourse.status : newCourse.status}
                onChange={(e) =>
                  editingCourse
                    ? setEditingCourse({ ...editingCourse, status: e.target.value as any })
                    : setNewCourse({ ...newCourse, status: e.target.value as any })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white sm:col-span-2"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 mt-4">
              <Button onClick={editingCourse ? handleSaveEdit : handleAddCourse}>
                {editingCourse ? "Save Changes" : "Add Course"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingCourse(null);
                  setNewCourse(defaultCourse);
                  setShowForm(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coursesLoading
          ? [...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64"></div>
              </div>
            ))
          : filteredCourses.length === 0
          ? <p className="text-center text-gray-500 dark:text-gray-400">No courses found.</p>
          : filteredCourses.map((course) => (
              <Card key={course.id}>
                <CardContent>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{course.title}</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Instructor: {course.instructorName} | Status: {course.status}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Edit2
                      className="w-5 h-5 text-blue-500 cursor-pointer hover:text-blue-700"
                      onClick={() => {
                        setEditingCourse(course);
                        setShowForm(true);
                      }}
                    />
                    <Trash2
                      className="w-5 h-5 text-red-500 cursor-pointer hover:text-red-700"
                      onClick={() => handleDeleteCourse(course.id!)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  );
};
